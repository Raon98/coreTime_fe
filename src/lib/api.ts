import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { notifications } from '@mantine/notifications';

// --- Types ---
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string; };
}

export interface OAuth2LoginResult {
    isSignUpRequired: boolean;
    signupToken?: string;
    accessToken?: string;
    refreshToken?: string;
    accountId?: string;
    identity?: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
    organizationId?: string; // TSID: string
}

export interface MeResult {
    accountId: string;
    name: string;
    identity: 'OWNER' | 'INSTRUCTOR' | 'MEMBER' | 'SYSTEM_ADMIN';
    organizationId: string | null;
    organizationName: string | null;
}

export interface Payment {
    id: string; // Key 호환을 위해 string
    membershipId: string;
    memberName: string;
    productName: string;
    amount: number;
    status: 'PAID' | 'REFUNDED' | 'CANCELLED';
    paidAt: string;
}

// --- API Client ---
const getBaseUrl = () => {
    const root = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
    return `${root.replace(/\/$/, '')}/api/v1`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
});

// --- Interceptors ---
api.interceptors.request.use(async (config) => {
    const session: any = await getSession();
    if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    if (session?.user?.organizationId) {
        config.headers['X-Organization-ID'] = String(session.user.organizationId);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                await signOut({ callbackUrl: '/login' });
            }
        }
        return Promise.reject(error);
    }
);

// --- API Functions ---
export const authApi = {
    login: async (command: any) => {
        const res = await api.post<ApiResponse<OAuth2LoginResult>>('/auth/login', command);
        return res.data.data;
    },
    getMe: async () => {
        const res = await api.get<ApiResponse<MeResult>>('/auth/me');
        return res.data.data;
    },
    reissue: async (command: any) => {
        const res = await api.post<ApiResponse<any>>('/auth/reissue', command);
        return res.data.data;
    }
};

export const paymentApi = {
    getAll: async () => {
        const res = await api.get<ApiResponse<Payment[]>>('/finance/payments');
        return res.data.data;
    },
    refund: async (paymentId: string) => { // String -> string 수정
        const res = await api.post<ApiResponse<any>>(`/finance/payments/${paymentId}/refund`);
        return res.data;
    }
};

export default api;
