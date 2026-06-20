import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { setupDb } from '../../db/db';
import { users, refreshTokens } from '../../db/schema';
import { AppError } from '../../utils/AppError';
import { BindingsType } from '../../types';

export class AuthService {
  // Create a private property to hold the cached database instance
  private dbInstance: ReturnType<typeof setupDb> | null = null;

  constructor(private env: BindingsType) {}

  // Memoize the connection so setupDb runs only once
  private db() {
    if (!this.dbInstance) {
      this.dbInstance = setupDb(this.env.HYPERDRIVE.connectionString);
    }
    return this.dbInstance;
  }

  private async generateTokens(userId: string, role: string) {
    const accessExp = Math.floor(Date.now() / 1000) + 60 * 15; // 15 Minutes
    const refreshExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 Days

    const accessToken = await sign(
      { id: userId, role, exp: accessExp },
      this.env.JWT_SECRET,
      'HS256',
    );
    const refreshToken = await sign(
      { id: userId, exp: refreshExp },
      this.env.JWT_REFRESH_SECRET,
      'HS256',
    );

    await this.db()
      .insert(refreshTokens)
      .values({
        userId,
        token: refreshToken,
        expiresAt: new Date(refreshExp * 1000),
      });

    return { accessToken, refreshToken };
  }

  async register(data: any) {
    const db = this.db();
    if (!data.termsAccepted) throw new AppError('Terms and conditions not accepted');
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.mobile, data.mobile))
      .limit(1);
    if (existingUser.length > 0) throw new AppError('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await db
      .insert(users)
      .values({
        mobile: data.mobile,
        password: hashedPassword,
        role: data.role,
        status: 'ACTIVE',
      })
      .returning();

    return {
      id: newUser[0].id,
      mobile: newUser[0].mobile,
      role: newUser[0].role,
    };
  }

  async login(data: any) {
    const db = this.db();

    const userRecord = await db.select().from(users).where(eq(users.mobile, data.mobile)).limit(1);
    if (userRecord.length === 0) throw new AppError('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(data.password, userRecord[0].password);
    if (!isMatch) throw new AppError('Invalid credentials');

    const tokens = await this.generateTokens(userRecord[0].id, userRecord[0].role);

    return {
      ...tokens,
      user: {
        id: userRecord[0].id,
        mobile: userRecord[0].mobile,
        role: userRecord[0].role,
      },
    };
  }

  async rotateRefreshToken(oldRefreshToken: string) {
    const db = this.db();

    try {
      const decoded = await verify(oldRefreshToken, this.env.JWT_REFRESH_SECRET, 'HS256');

      const tokenRecord = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, oldRefreshToken))
        .limit(1);

      if (tokenRecord.length === 0) {
        throw new AppError('Refresh token revoked or invalid', 401);
      }

      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord[0].id));

      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id as string))
        .limit(1);
      if (userRecord.length === 0 || userRecord[0].status !== 'ACTIVE') {
        throw new AppError('User account is inactive or deleted');
      }

      return await this.generateTokens(userRecord[0].id, userRecord[0].role);
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }
}
