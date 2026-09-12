interface LoginInput {
    email: string;
    password: string;
}
export declare const loginUser: ({ email, password, }: LoginInput) => Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
    };
}>;
export declare const refreshAccessToken: (refreshToken: string) => Promise<{
    accessToken: string;
}>;
export declare const logoutUser: (refreshToken: string) => Promise<void>;
export declare const getUserById: (userId: number) => Promise<{
    createdAt: Date;
    email: string;
    id: number;
    name: string;
    role: import("@prisma/client").$Enums.Role;
} | null>;
export declare const registerUser: (name: string, email: string, password: string) => Promise<{
    createdAt: Date;
    email: string;
    id: number;
    name: string;
    role: import("@prisma/client").$Enums.Role;
}>;
export {};
//# sourceMappingURL=auth.service.d.ts.map