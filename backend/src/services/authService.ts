import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { query } from "../config/db";
import { env } from "../config/env";
import { HttpError } from "../middlewares/errorHandler";

const SALT_ROUNDS = 12;

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

function signToken(user: Pick<UserRow, "id" | "username">): string {
  return jwt.sign({ id: user.id, username: user.username }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function registerUser(username: string, password: string) {
  const existing = await query<UserRow>("SELECT id FROM users WHERE username = $1", [username]);
  if (existing.rowCount && existing.rowCount > 0) {
    throw new HttpError(409, "Username is already taken");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();

  const result = await query<UserRow>(
    `INSERT INTO users (id, username, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, created_at`,
    [id, username, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken(user);

  return { user: { id: user.id, username: user.username, createdAt: user.created_at }, token };
}

export async function loginUser(username: string, password: string) {
  const result = await query<UserRow>("SELECT * FROM users WHERE username = $1", [username]);
  const user = result.rows[0];

  if (!user) {
    throw new HttpError(401, "Invalid username or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, "Invalid username or password");
  }

  const token = signToken(user);

  return { user: { id: user.id, username: user.username, createdAt: user.created_at }, token };
}
