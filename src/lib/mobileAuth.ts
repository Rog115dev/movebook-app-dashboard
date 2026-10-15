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
  const allowedTypes = ['athlete', 'coach', 'club'] as const;
  type UserType = (typeof allowedTypes)[number];
  const userType: UserType = allowedTypes.includes(
    (input.userType || '') as UserType
  )
    ? ((input.userType || 'athlete') as UserType)
    : 'athlete';

  const user = await UserModel.create({
    name: input.name.trim(),
    username,
    email,
    passwordHash,
    userType,
    country: (input.country || 'US').trim() || 'US',
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
