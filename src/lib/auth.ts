
import { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "./api"; // We will need to adjust api.ts or use axios directly here to avoid circular dep if api.ts uses getSession

function decodeJwt(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Extend built-in types
declare module "next-auth" {
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        error?: string;
        user: {
            id?: string | number;
            role?: string;
            organizationId?: number;
            signupToken?: string;
            isSignUpRequired?: boolean;
        } & User;
    }
    interface User {
        id: string; // NextAuth expects string usually
        role?: string;
        accessToken?: string;
        refreshToken?: string;
        signupToken?: string;
        isSignUpRequired?: boolean;
        organizationId?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        role?: string;
        organizationId?: number;
        signupToken?: string;
        isSignUpRequired?: boolean;
        expiresAt?: number;
        error?: "RefreshAccessTokenError";
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID || "",
            clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                accessToken: { label: "Access Token", type: "text" },
                refreshToken: { label: "Refresh Token", type: "text" },
                role: { label: "Role", type: "text" },
                signupToken: { label: "Signup Token", type: "text" },
                accountId: { label: "Account ID", type: "text" },
                organizationId: { label: "Organization ID", type: "text" },
                name: { label: "Name", type: "text" },
                email: { label: "Email", type: "text" }
            },
            async authorize(credentials, req) {
                // This provider is used to manually update the session after signup/refresh
                // Relaxed check: Allow just accessToken (e.g. for temp onboarding tokens)
                if (credentials?.accessToken) {
                    return {
                        id: credentials.accountId || "manual-update",
                        accessToken: credentials.accessToken,
                        refreshToken: credentials.refreshToken || "",
                        role: credentials.role,
                        signupToken: credentials.signupToken,
                        organizationId: credentials.organizationId ? Number(credentials.organizationId) : undefined,
                        name: credentials.name,
                        email: credentials.email,
                    } as User;
                }
                return null;
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'credentials') return true;

            if (account && (account.provider === 'google' || account.provider === 'kakao')) {
                try {

                    const loginCommand = {
                        provider: account.provider as 'google' | 'kakao',
                        providerId: account.providerAccountId,
                        email: user.email || "",
                        username: user.name || "Unknown",
                        avatarUrl: user.image || "",
                    };

                    const response = await authApi.login(loginCommand);
                    console.log("[NextAuth] Backend Login Response:", JSON.stringify(response, null, 2));

                    // Mutate the user object to pass data to the JWT callback
                    user.accessToken = response.accessToken;
                    user.refreshToken = response.refreshToken;
                    user.isSignUpRequired = response.isSignUpRequired;
                    // Handle potential snake_case from backend
                    user.signupToken = response.signupToken || (response as any).signup_token;
                    // Mapped fields
                    if (response.accountId) user.id = String(response.accountId);
                    if (response.identity) user.role = response.identity;
                    if (response.organizationId) user.organizationId = response.organizationId;

                    return true;
                } catch (error) {
                    console.error("Backend login failed during NextAuth signIn", error);
                    return false; // blocks sign in
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Initial sign in
            if (user && account) {
                console.log("[NextAuth] JWT Callback - Initial User:", JSON.stringify(user, null, 2));
                const decoded = user.accessToken ? decodeJwt(user.accessToken) : null;
                return {
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    role: user.role,
                    organizationId: user.organizationId,
                    signupToken: user.signupToken,
                    isSignUpRequired: user.isSignUpRequired,
                    // Use decoding to find actual expiry, fallback to 1 hour
                    expiresAt: decoded?.exp ? decoded.exp * 1000 : Date.now() + (60 * 60 * 1000),
                };
            }

            // Return previous token if the access token has not expired yet
            if (token.expiresAt && Date.now() < token.expiresAt) {
                return token;
            }

            // Access token has expired, try to update it
            // Backend Refresh Logic
            try {
                if (!token.refreshToken || !token.accessToken) throw new Error("No tokens");

                const result = await authApi.reissue({
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken
                });

                const decoded = result.accessToken ? decodeJwt(result.accessToken) : null;
                return {
                    ...token,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: decoded?.exp ? decoded.exp * 1000 : Date.now() + (60 * 60 * 1000),
                };
            } catch (error) {
                console.error("Error refreshing Access Token", error);
                return { ...token, error: "RefreshAccessTokenError" as const };
            }
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken; // Expose refresh token
            session.error = token.error;
            session.user.role = token.role;
            session.user.organizationId = token.organizationId;
            session.user.isSignUpRequired = token.isSignUpRequired;
            session.user.signupToken = token.signupToken;
            console.log("[NextAuth] Session Callback - Token:", JSON.stringify(token, null, 2));
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Error code passed in query string
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "changeme_dev_secret",
};
