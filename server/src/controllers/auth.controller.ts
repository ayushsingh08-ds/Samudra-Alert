import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import DeviceToken from '../models/DeviceToken.model';
import { registerSchema, loginSchema, regionForPoint } from '@samudra/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { env, isProd } from '../config/env';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory refresh-token denylist (swap for Redis in multi-instance prod)
const revokedRefreshTokens = new Map<string, number>();

export function revokeRefreshToken(token: string): void {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const ttlMs = decoded?.exp ? decoded.exp * 1000 - Date.now() : REFRESH_TTL_MS;
    revokedRefreshTokens.set(token, Date.now() + Math.max(ttlMs, 0));
  } catch {
    revokedRefreshTokens.set(token, Date.now() + REFRESH_TTL_MS);
  }
}

function isRevoked(token: string): boolean {
  const exp = revokedRefreshTokens.get(token);
  if (!exp) return false;
  if (exp < Date.now()) {
    revokedRefreshTokens.delete(token);
    return false;
  }
  return true;
}

// Periodic cleanup of expired denylist entries
setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of revokedRefreshTokens) {
    if (exp < now) revokedRefreshTokens.delete(token);
  }
}, 60 * 60 * 1000).unref();

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd, // Capacitor Android WebView runs on http://localhost -> needs secure=false in dev
    sameSite: isProd ? 'none' : 'lax',
    maxAge: REFRESH_TTL_MS,
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
  setRefreshCookie(res, refreshToken);

  res.json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  if (isRevoked(refreshToken)) {
    return res.status(401).json({ message: 'Token revoked' });
  }

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: string;
    };

    // Rotate: revoke old, issue new pair
    revokeRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.role);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) revokeRefreshToken(refreshToken);

  if ((req as any).user?.id) {
    await DeviceToken.deleteMany({ user: (req as any).user.id });
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});
