import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
import { eq, and } from "drizzle-orm";
import { setupDb } from "../../db/db";
import { users, refreshTokens } from "../../db/schema";
import { AppError } from "../../utils/AppError";

export class AuthService {
  constructor(
    private env: { DATABASE_URL: string; JWT_SECRET: string; JWT_REFRESH_SECRET: string },
  ) {}

  // Helper method for dual-token generation
  private async generateTokens(userId: string, role: string, db: any) {
    const accessExp = Math.floor(Date.now() / 1000) + 60 * 15; // 15 Minutes
    const refreshExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 Days

    const accessToken = await sign(
      { id: userId, role, exp: accessExp },
      this.env.JWT_SECRET,
      "HS256",
    );
    const refreshToken = await sign(
      { id: userId, exp: refreshExp },
      this.env.JWT_REFRESH_SECRET,
      "HS256",
    );

    // Store Refresh Token in DB to support multi-device and revocation
    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt: new Date(refreshExp * 1000),
    });

    return { accessToken, refreshToken };
  }

  async register(data: any) {
    const db = setupDb(this.env.DATABASE_URL);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.mobile, data.mobile))
      .limit(1);
    if (existingUser.length > 0) throw new AppError("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await db
      .insert(users)
      .values({
        mobile: data.mobile,
        password: hashedPassword,
        role: data.role,
        status: "ACTIVE",
      })
      .returning();

    return { id: newUser[0].id, mobile: newUser[0].mobile, role: newUser[0].role };
  }

  async login(data: any) {
    const db = setupDb(this.env.DATABASE_URL);

    const userRecord = await db.select().from(users).where(eq(users.mobile, data.mobile)).limit(1);
    if (userRecord.length === 0) throw new AppError("Invalid credentials", 401);

    const isMatch = await bcrypt.compare(data.password, userRecord[0].password);
    if (!isMatch) throw new AppError("Invalid credentials");

    const tokens = await this.generateTokens(userRecord[0].id, userRecord[0].role, db);

    return {
      ...tokens,
      user: { id: userRecord[0].id, mobile: userRecord[0].mobile, role: userRecord[0].role },
    };
  }

  async rotateRefreshToken(oldRefreshToken: string) {
    const db = setupDb(this.env.DATABASE_URL);

    try {
      // Verify cryptographic signature of the old refresh token
      const decoded = await verify(oldRefreshToken, this.env.JWT_REFRESH_SECRET, "HS256");

      // Check if token actually exists in the DB (prevents revoked tokens from being used)
      const tokenRecord = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, oldRefreshToken))
        .limit(1);

      if (tokenRecord.length === 0) {
        // If signature is valid but not in DB, it was revoked or already used (possible token theft)
        // In strict implementations, you might revoke ALL tokens for this user here.
        throw new AppError("Refresh token revoked or invalid", 401);
      }

      // Delete the old token (Token Rotation)
      await db.delete(refreshTokens).where(eq(refreshTokens.id, tokenRecord[0].id));

      // Get user to encode new role in case it was updated
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id as string))
        .limit(1);
      if (userRecord.length === 0 || userRecord[0].status !== "ACTIVE") {
        throw new AppError("User account is inactive or deleted");
      }

      // Generate and store new token pair
      return await this.generateTokens(userRecord[0].id, userRecord[0].role, db);
    } catch (error) {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}
