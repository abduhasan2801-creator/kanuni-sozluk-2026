import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { dictionaryStore } from './database.ts';

export type AdminRole = 'Admin' | 'Legal Reviewer' | 'Linguistic Editor';

export interface AdminSession {
  role: AdminRole;
  issuedAt: number;
  expiresAt: number;
}

export interface AdminAuthRequest extends Request {
  adminSession?: AdminSession;
}

// Ephemeral fallback signing key when SESSION_SECRET is unset (never written to .env.example)
const SIGNING_SECRET =
  (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim()) ||
  crypto.randomBytes(32).toString('hex');

function signToken(payload: AdminSession): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SIGNING_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token: string): AdminSession | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', SIGNING_SECRET).update(body).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as AdminSession;
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function getAuthSetupState() {
  const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim());
  const claimed = Boolean(dictionaryStore.getAdminRecord());
  return {
    envConfigured,
    needsFirstRunClaim: !envConfigured && !claimed,
  };
}

export function bootstrapAdminPassword(password: string): { token?: string; role?: AdminRole; error?: string } {
  const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim());
  if (envConfigured) {
    return { error: 'Administrator passcode is managed via environment configuration.' };
  }
  if (dictionaryStore.getAdminRecord()) {
    return { error: 'Administrator account has already been claimed.' };
  }
  if (!password || password.length < 8) {
    return { error: 'Passcode must be at least 8 characters.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  dictionaryStore.saveAdminRecord({
    passwordHash,
    salt,
    role: 'Admin',
    claimedAt: new Date().toISOString(),
  });

  const session: AdminSession = {
    role: 'Admin',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 8,
  };
  return { token: signToken(session), role: 'Admin' };
}

export function verifyAdminLogin(
  password: string,
  requestedRole: AdminRole = 'Admin'
): { token?: string; role?: AdminRole; error?: string } {
  if (!password) {
    return { error: 'Invalid administrator passcode.' };
  }
  const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
  const safeRole: AdminRole =
    requestedRole === 'Legal Reviewer' || requestedRole === 'Linguistic Editor'
      ? requestedRole
      : 'Admin';

  if (envPasscode) {
    const a = Buffer.from(password);
    const b = Buffer.from(envPasscode);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      const session: AdminSession = {
        role: safeRole,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 8,
      };
      return { token: signToken(session), role: safeRole };
    }
    return { error: 'Invalid administrator passcode.' };
  }

  const record = dictionaryStore.getAdminRecord();
  if (!record) {
    return { error: 'Administrator passcode has not been claimed yet.' };
  }

  const computed = hashPassword(password, record.salt);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(record.passwordHash, 'hex');
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    const session: AdminSession = {
      role: safeRole,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 8,
    };
    return { token: signToken(session), role: safeRole };
  }
  return { error: 'Invalid administrator passcode.' };
}

export function requireAdminAuth(allowedRoles: AdminRole[] = ['Admin', 'Legal Reviewer', 'Linguistic Editor']) {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const token = header.slice('Bearer '.length).trim();
    const session = verifyToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session.' });
    }
    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: 'Insufficient role permissions for this action.' });
    }
    req.adminSession = session;
    next();
  };
}
