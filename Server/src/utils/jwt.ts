import jwt from "jsonwebtoken";

export interface AccessTokenPayload {
  userId: number;
  role: string;
}

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT secrets are not configured");
}

export const generateAccessToken = (
  userId: number,
  role: string
): string => {
  return jwt.sign(
    {
      userId,
      role,
    },
    accessSecret,
    {
      expiresIn: "15m",
    }
  );
};

export const generateRefreshToken = (
  userId: number,
  role: string
): string => {
  return jwt.sign(
    {
      userId,
      role,
    },
    refreshSecret,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, accessSecret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, refreshSecret) as AccessTokenPayload;
};