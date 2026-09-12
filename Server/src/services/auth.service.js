import { prisma } from "../config/database.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, } from "../utils/jwt.js";
import { hashToken } from "../utils/token.js";
export const loginUser = async ({ email, password, }) => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const refreshTokenHash = hashToken(refreshToken);
    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
export const refreshAccessToken = async (refreshToken) => {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
        where: {
            tokenHash,
        },
    });
    if (!storedToken) {
        throw new Error("Invalid refresh token");
    }
    if (storedToken.revokedAt) {
        throw new Error("Refresh token has been revoked");
    }
    if (storedToken.expiresAt < new Date()) {
        throw new Error("Refresh token has expired");
    }
    if (storedToken.userId !== payload.userId) {
        throw new Error("Invalid refresh token");
    }
    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const accessToken = generateAccessToken(user.id, user.role);
    return {
        accessToken,
    };
};
export const logoutUser = async (refreshToken) => {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};
export const getUserById = async (userId) => {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
export const registerUser = async (name, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
    });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    const passwordHash = await hashPassword(password);
    return prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: "DEVELOPER",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
//# sourceMappingURL=auth.service.js.map