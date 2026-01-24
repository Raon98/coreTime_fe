import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// --- Types ---

export interface OAuth2LoginCommand {
    provider: 'google' | 'kakao';
    providerId: string;
    email: string;
    username: string;
    avatarUrl?: string;
}

export interface OAuth2LoginResult {
    isSignUpRequired: boolean;
    signupToken?: string;
    accessToken?: string;
    refreshToken?: string;
    accountId?: number;
    identity?: 'OWNER' | 'INSTRUCTOR' | 'MEMBER'; // Adjusted "STAFF" to "INSTRUCTOR" based on context files, but spec said STAFF. Will check.
    isPending?: boolean;
    organizationId?: number;
}

export interface InviteCodeValidationResult {
    valid: boolean;
    organizationId: number;
    organizationName: string;
    organizationAddress: string;
}

export interface SignUpCommand {
    signupToken: string;
    email: string;
    name: string;
    phone?: string;
    identity: 'OWNER' | 'INSTRUCTOR';
    inviteCode?: string;
    organizationId?: number;
}

export interface SignUpResult {
    accessToken: string;
    refreshToken: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL';
}

export interface ReissueTokenResult {
    accessToken: string;
    refreshToken: string;
}

export interface MeResult {
    id: number;
    name: string;
    email: string;
    role: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
    // Add other fields as returned by /auth/me
}

// --- API Client ---

const BASE_URL = 'https://core.api-talkterview.com/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Token Management ---

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};
export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

// --- Interceptors ---

// Request: Attach Access Token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response: Handle 401 & Refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = getRefreshToken();
            const accessToken = getAccessToken();

            if (refreshToken && accessToken) {
                try {
                    // Call Reissue Endpoint
                    const { data } = await axios.post<ReissueTokenResult>(`${BASE_URL}/auth/reissue`, {
                        accessToken,
                        refreshToken,
                    });

                    // Save new tokens
                    setTokens(data.accessToken, data.refreshToken);

                    // Retry original request
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    }
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - Logout
                    clearTokens();
                    window.location.href = '/login'; // Force redirect
                    return Promise.reject(refreshError);
                }
            } else {
                // No tokens to refresh
                clearTokens();
                // Only redirect if not already on login page to avoid loops?
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export interface RegisterOrganizationCommand {
    name: string;
    representativeName: string;
    businessNumber: string;
    category: string;
    address: string;
    phone: string;
}

export interface OrganizationDto {
    id: number;
    name: string;
    address: string;
    phone?: string;
    representativeName?: string;
}

export interface InviteCodeResult {
    code: string;
    expireAt: string; // or Date/Instant
    remainingSeconds: number;
}

// --- API Functions ---

export const authApi = {
    login: async (command: OAuth2LoginCommand) => {
        const response = await api.post<OAuth2LoginResult>('/auth/login', command);
        return response.data;
    },

    validateInviteCode: async (code: string) => {
        const response = await api.get<InviteCodeValidationResult>('/invite-codes/validate', {
            params: { code }
        });
        return response.data;
    },

    signUp: async (command: SignUpCommand) => {
        const response = await api.post<SignUpResult>('/auth/signup', command);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<MeResult>('/auth/me');
        return response.data;
    },

    // --- Center Management ---

    registerOrganization: async (command: RegisterOrganizationCommand) => {
        const response = await api.post<OrganizationDto>('/management/organizations', command);
        return response.data;
    },

    getOrganizations: async () => {
        const response = await api.get<OrganizationDto[]>('/management/organizations');
        return response.data;
    },

    // --- Invite Code Management ---

    getInviteCode: async (organizationId: number) => {
        const response = await api.get<InviteCodeResult>(`/organizations/${organizationId}/invite-codes`);
        return response.data;
    },

    reissueInviteCode: async (organizationId: number) => {
        const response = await api.post<InviteCodeResult>(`/organizations/${organizationId}/invite-codes/reissue`);
        return response.data;
    }
};

export default api;
