import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectMongo } from './mongodb';
import { publicUser, UserModel, type UserDocument } from './userModel';

const JWT_SECRET =
  process.env.MOBILE_JWT_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  'fitai-mobile-dev-secret';

const TOKEN_TTL = '30d';

export type MobileJwtPayload = {
  sub: string;
  username: string;
  email: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signMobileToken(user: UserDocument) {
  const payload: MobileJwtPayload = {
    sub: String(user._id),
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyMobileToken(token: string): MobileJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as MobileJwtPayload;
  } catch {
    return null;
  }
}

export async function findUserByIdentifier(identifier: string) {
  await connectMongo();
  const value = identifier.trim().toLowerCase();
  return UserModel.findOne({
    $or: [{ email: value }, { username: value }],
  });
}

export async function registerMobileUser(input: {
  name: string;
  username: string;
  email: string;
  password: string;
  userType?: string;
  country?: string;
  sports?: string[] | string;
  sport?: string;
  firstName?: string;
  surname?: string;
  gender?: string;
}) {
  await connectMongo();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  const exists = await UserModel.findOne({
    $or: [{ email }, { username }],
  });
  if (exists) {
    const field = exists.email === email ? 'email' : 'username';
    throw new Error(`An account with that ${field} already exists.`);
  }

  const passwordHash = await hashPassword(input.password);
  const allowedTypes = [
    'athlete',
    'coaches',
    'teams',
    'clubs',
    'groups',
  ] as const;
  type UserType = (typeof allowedTypes)[number];
  const rawType = (input.userType || 'athlete').trim().toLowerCase();
  const normalizedType =
    rawType === 'coach'
      ? 'coaches'
      : rawType === 'club'
        ? 'clubs'
        : rawType === 'team'
          ? 'teams'
          : rawType === 'group'
            ? 'groups'
            : rawType;
  const userType: UserType = allowedTypes.includes(
    normalizedType as UserType
  )
    ? (normalizedType as UserType)
    : 'athlete';

  const country = (input.country || '').trim().toUpperCase();
  if (!country || country.length < 2) {
    throw new Error('Country is required.');
  }

  const sportsRaw = Array.isArray(input.sports)
    ? input.sports
    : typeof input.sports === 'string' && input.sports.trim()
      ? input.sports.split(/[,|]/)
      : typeof input.sport === 'string' && input.sport.trim()
        ? [input.sport]
        : [];
  const sports = Array.from(
    new Set(
      sportsRaw.map((s) => String(s || '').trim().toLowerCase()).filter(Boolean)
    )
  );
  if (!sports.length) {
    throw new Error('At least one sport is required.');
  }

  const user = await UserModel.create({
    name: input.name.trim(),
    username,
    email,
    passwordHash,
    userType,
    country,
    sports,
    sport: sports[0] || '',
    firstName: input.firstName?.trim(),
    surname: input.surname?.trim(),
    gender: input.gender?.trim(),
  });

  const token = signMobileToken(user);
  return { token, user: publicUser(user) };
}

export async function loginMobileUser(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new Error('Invalid email/username or password.');
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    throw new Error('Invalid email/username or password.');
  }
  const token = signMobileToken(user);
  return { token, user: publicUser(user) };
}
