import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { setupDb } from '../../db/db';
import { users, refreshTokens } from '../../db/schema';
import { AppError } from '../../utils/AppError';
import { BindingsType } from '../../types';
import { LoginDto, RefreshTokenDto, RegisterUserDto } from './auth.validation';
import { AUTH_ERRORS } from './auth.messages';

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

  async register(data: RegisterUserDto) {
    const db = this.db();
    if (!data.termsAccepted) throw new AppError(AUTH_ERRORS.TERMS_NOT_ACCEPTED);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.mobile, data.mobile))
      .limit(1);
    if (existingUser) throw new AppError(AUTH_ERRORS.USER_EXISTS, 409);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const [newUser] = await db
      .insert(users)
      .values({
        mobile: data.mobile,
        password: hashedPassword,
        role: data.role,
        status: 'ACTIVE',
      })
      .returning();

    return {
      id: newUser.id,
      mobile: newUser.mobile,
      role: newUser.role,
    };
  }

  async login(data: LoginDto) {
    const db = this.db();

    const [user] = await db.select().from(users).where(eq(users.mobile, data.mobile)).limit(1);
    if (!user) throw new AppError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
    if (user.status !== 'ACTIVE') {
      throw new AppError(AUTH_ERRORS.ACCOUNT_NOT_ACTIVE(user.status), 403);
    }
    if (!user.password) {
      throw new AppError(AUTH_ERRORS.PASSWORD_NOT_SET, 400);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new AppError(AUTH_ERRORS.PASSWORD_NOT_SET, 401);

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      ...tokens,
      user: {
        id: user.id,
        mobile: user.mobile,
        role: user.role,
      },
    };
  }

  async rotateRefreshToken(data: RefreshTokenDto) {
    const db = this.db();

    try {
      const decoded = await verify(data.refreshToken, this.env.JWT_REFRESH_SECRET, 'HS256');

      const [tokenRecord] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, data.refreshToken))
        .limit(1);

      if (!tokenRecord) {
        throw new AppError(AUTH_ERRORS.TOKEN_INVALID, 401);
      }

      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord.id));

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id as string))
        .limit(1);
      if (!user || user.status !== 'ACTIVE') {
        throw new AppError(AUTH_ERRORS.ACCOUNT_NOT_ACTIVE(user.status));
      }

      return await this.generateTokens(user.id, user.role);
    } catch {
      throw new AppError(AUTH_ERRORS.TOKEN_INVALID, 401);
    }
  }

  async logout(data: RefreshTokenDto) {
    const db = this.db();

    // Attempt to delete and return the deleted records
    const [deletedTokens] = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.token, data.refreshToken))
      .returning();

    if (!deletedTokens) {
      throw new AppError(AUTH_ERRORS.TOKEN_INVALID, 401);
    }
  }
}
