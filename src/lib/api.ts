import axios, { AxiosError, InternalAxiosRequestConfig as OriginalInternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// --- Types & Interfaces ---
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: { code: string; message: string; };
}

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
    accountId?: string;
    identity?: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
    isPending?: boolean;
    organizationId?: string;
}

export interface InviteCodeValidationResult {
    valid: boolean;
    organizationId: string;
    organizationName: string;
    organizationAddress: string;
}

export interface SignUpCommand {
    signupToken: string;
    email: string;
    name: string;
    phone: string;
    identity: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
}

export interface JoinOrganizationCommand {
    organizationId?: string;
    inviteCode?: string;
    identity: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
}

export interface SignUpResult {
    accountId: string;
    organizationId: string;
    identity: 'OWNER' | 'INSTRUCTOR' | 'MEMBER';
    status: 'ACTIVE' | 'PENDING_APPROVAL';
    accessToken: string;
    refreshToken: string;
}

export interface ReissueResult {
    accessToken: string;
    refreshToken: string;
}

export interface MeResult {
    accountId: string;
    name: string;
    identity: 'OWNER' | 'INSTRUCTOR' | 'MEMBER' | 'SYSTEM_ADMIN';
    organizationId: string | null;
    organizationName: string | null;
    profileImageUrl?: string | null;
}

export interface OrganizationResult {
    id: string;
    name: string;
    address: string;
    phone?: string;
    representativeName?: string;
    status: 'ACTIVE' | 'PENDING' | 'PENDING_APPROVAL' | 'REJECTED';
}
export type OrganizationDto = OrganizationResult;

export interface InstructorDto {
    membershipId: string;
    accountId: string;
    name: string;
    email: string;
    phone: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'INACTIVE' | 'WITHDRAWN';
    profileImageUrl?: string | null;
    joinedAt?: string;
}

export type TicketProductType = 'ONE_TO_ONE' | 'GROUP';
export interface TicketProduct {
    id: string;
    name: string;
    type: TicketProductType;
    sessionCount: number;
    durationDays: number;
    price: number;
    isActive: boolean;
    createdAt: string;
}

export type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';
export type PaymentStatus = 'PAID' | 'REFUNDED' | 'CANCELLED';
export interface Payment {
    id: string;
    membershipId: string;
    memberName: string;
    productName: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: string;
    refundedAt?: string;
    linkedTicketId?: string | null;
}

export type TicketStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'EXHAUSTED' | 'DELETED';
export interface MemberTicketResult {
    id: string;
    membershipId: string;
    ticketName: string;
    totalCount: number;
    remainingCount: number;
    startDate: string;
    endDate: string;
    paymentId?: string;
    ticketProductId?: string;
    status: TicketStatus;
}

export interface IssueTicketCommand {
    membershipId: string;
    ticketName: string;
    totalCount: number;
    startDate: string;
    endDate: string;
    paymentId?: string;
    ticketProductId?: string;
}

export interface CreatePaymentCommand {
    membershipId: string;
    productId: string;
    amount: number;
    method: PaymentMethod;
    linkedTicketId?: string | null;
    autoIssue?: boolean;
}

export interface MembershipDto {
    id: string;
    name: string;
    phone: string;
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'REJECTED' | 'INACTIVE' | 'WITHDRAWN';
    gender?: 'MALE' | 'FEMALE';
    birthDate?: string;
    profileImageUrl?: string | null;
    pinnedNote?: string | null;
    createdAt: string;
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

// --- Token Management ---
let sessionCache: { session: any; timestamp: number } | null = null;
export const clearSessionCache = () => { sessionCache = null; };

const getCachedSession = async () => {
    const now = Date.now();
    if (sessionCache && (now - sessionCache.timestamp) < 1000) return sessionCache.session;
    const session = await getSession();
    sessionCache = { session, timestamp: now };
    return session;
};

// --- Interceptors ---
interface InternalAxiosRequestConfig extends OriginalInternalAxiosRequestConfig { _skipAuthRedirect?: boolean; }

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const session = await getCachedSession();
    if (session?.accessToken) config.headers.Authorization = `Bearer ${session.accessToken}`;
    if (session?.user?.organizationId) config.headers['X-Organization-ID'] = String(session.user.organizationId);
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

// --- API Objects ---
export const authApi = {
    login: async (cmd: OAuth2LoginCommand) => (await api.post<ApiResponse<OAuth2LoginResult>>('/auth/login', cmd)).data.data,
    signUp: async (cmd: SignUpCommand) => (await api.post<ApiResponse<SignUpResult>>('/auth/signup', cmd)).data.data,
    getMe: async (cfg?: any) => (await api.get<ApiResponse<MeResult>>('/auth/me', cfg)).data.data,
    logout: async () => { await api.post('/auth/logout'); },
    reissue: async (cmd: any) => (await api.post<ApiResponse<ReissueResult>>('/auth/reissue', cmd)).data.data,
    getMyOrganizations: async () => (await api.get<ApiResponse<OrganizationResult[]>>('/management/organizations/my')).data.data,
    getPendingInstructors: async () => (await api.get<ApiResponse<InstructorDto[]>>('/management/pending-instructors')).data.data,
    getActiveInstructors: async () => (await api.get<ApiResponse<InstructorDto[]>>('/management/instructors')).data.data,
    updateMembershipStatus: async (id: string, isApproved: boolean) => (await api.patch(`/management/memberships/${id}/status`, null, { params: { isApproved } })).data.data,
};

export const memberApi = {
    getMembers: async (params?: any) => (await api.get<ApiResponse<MembershipDto[]>>('/memberships', { params })).data.data,
    updateMember: async (id: string, cmd: any) => (await api.patch<ApiResponse<MembershipDto>>(`/memberships/${id}`, cmd)).data.data,
    registerByStaff: async (cmd: any) => (await api.post<ApiResponse<MembershipDto>>('/memberships/register', cmd)).data.data,
};

export const paymentApi = {
    create: async (cmd: CreatePaymentCommand) => (await api.post<ApiResponse<Payment>>('/finance/payments', cmd)).data.data,
    getAll: async () => (await api.get<ApiResponse<Payment[]>>('/finance/payments')).data.data,
    refund: async (id: string) => (await api.post<ApiResponse<any>>(`/finance/payments/${id}/refund`)).data,
    getAvailable: async (membershipId: string) => (await api.get<ApiResponse<Payment[]>>('/finance/payments/available', { params: { membershipId } })).data.data,
};

export const ticketProductApi = {
    create: async (cmd: any) => (await api.post<ApiResponse<TicketProduct>>('/finance/tickets/products', cmd)).data.data,
    getAll: async () => (await api.get<ApiResponse<TicketProduct[]>>('/finance/tickets/products')).data.data,
    update: async (id: string, cmd: any) => (await api.put<ApiResponse<TicketProduct>>(`/finance/tickets/products/${id}`, cmd)).data.data,
};

export const memberTicketApi = {
    issueTicket: async (cmd: IssueTicketCommand) => (await api.post<ApiResponse<MemberTicketResult>>('/memberships/tickets', cmd)).data.data,
    getTickets: async () => (await api.get<ApiResponse<MemberTicketResult[]>>('/memberships/tickets')).data.data,
    updateStatus: async (id: string, pause: boolean) => (await api.patch(`/memberships/tickets/${id}/status`, { pause })).data.data,
    extendTicket: async (id: string, endDate: string) => (await api.patch(`/memberships/tickets/${id}/extend`, { endDate })).data.data,
    addCount: async (id: string, count: number) => (await api.patch(`/memberships/tickets/${id}/count`, { count })).data.data,
    deleteTicket: async (id: string) => (await api.delete(`/memberships/tickets/${id}`)).data,
};

export const profileApi = {
    updateProfile: async (cmd: any) => (await api.put('/profile/me', cmd)).data.data,
    getNotificationSettings: async () => (await api.get('/profile/me/notifications')).data.data,
};

// --- Query Keys (복구 및 명시적 Export) ---
export const queryKeys = {
    userProfile: ['user', 'profile'] as const,
    myOrganizations: ['organizations', 'my'] as const,
};

export const memberTicketKeys = {
    all: ['memberTickets'] as const,
    detail: (id: string) => ['memberTickets', id] as const,
};

export const financeKeys = {
    payments: ['payments'] as const,
    available: (membershipId: string) => ['payments', 'available', membershipId] as const,
    products: ['products'] as const,
};

export const memberKeys = {
    all: ['members'] as const,
    detail: (id: string) => ['members', id] as const,
};

export const scheduleKeys = {
    all: ['schedule'] as const,
    week: (date: string) => ['schedule', 'week', date] as const,
};

// --- React Query Hooks ---
export function useUserProfile() { return useQuery({ queryKey: queryKeys.userProfile, queryFn: authApi.getMe }); }
export function useMyOrganizations() { return useQuery({ queryKey: queryKeys.myOrganizations, queryFn: authApi.getMyOrganizations }); }
export function useActiveInstructors() { return useQuery({ queryKey: ['instructors', 'active'], queryFn: authApi.getActiveInstructors }); }
export function usePendingInstructors() { return useQuery({ queryKey: ['instructors', 'pending'], queryFn: authApi.getPendingInstructors }); }
export function useMemberTickets() { return useQuery({ queryKey: memberTicketKeys.all, queryFn: memberTicketApi.getTickets }); }
export function useMembersList() { return useQuery({ queryKey: memberKeys.all, queryFn: () => memberApi.getMembers() }); }
export function useAvailablePayments(id: string) { return useQuery({ queryKey: financeKeys.available(id), queryFn: () => paymentApi.getAvailable(id), enabled: !!id }); }

// Mock/Default Hooks
export function useDashboardStats(role: string) { return useQuery({ queryKey: ['dashboard', 'stats', role], queryFn: () => ({}) }); }
export function useRecentActivity(role: string) { return useQuery({ queryKey: ['dashboard', 'activity', role], queryFn: () => [] }); }
export function useCenterAlerts() { return useQuery({ queryKey: ['dashboard', 'alerts'], queryFn: () => [] }); }
export function useWeeklySchedule(date: Date) { return useQuery({ queryKey: scheduleKeys.week(date.toISOString()), queryFn: () => [] }); }
export function useRooms() { return useQuery({ queryKey: ['rooms'], queryFn: () => [] }); }
export function useScheduleInstructors() { return useQuery({ queryKey: ['schedule', 'instructors'], queryFn: () => [] }); }
export function useTicketsList() { return useQuery({ queryKey: ['tickets', 'list'], queryFn: () => [] }); }

export default api;
