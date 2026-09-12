export interface AccessTokenPayload {
    userId: number;
    role: string;
}
export declare const generateAccessToken: (userId: number, role: string) => string;
export declare const generateRefreshToken: (userId: number, role: string) => string;
export declare const verifyAccessToken: (token: string) => AccessTokenPayload;
export declare const verifyRefreshToken: (token: string) => AccessTokenPayload;
//# sourceMappingURL=jwt.d.ts.map