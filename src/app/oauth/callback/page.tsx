'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/context/AuthContext';
import { LoadingOverlay, Text, Center, Stack } from '@mantine/core';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { checkAuth } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) return;

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const signupToken = searchParams.get('signupToken');
        const isSignUpRequired = searchParams.get('isSignUpRequired') === 'true';

        // Also might receive user info for signup?
        const email = searchParams.get('email');
        const name = searchParams.get('name');

        if (accessToken && refreshToken) {
            hasProcessed.current = true;
            console.log('OAuth Callback: Processing tokens...');

            // Decode JWT to extract user info
            let decodedToken: any = {};
            try {
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                decodedToken = JSON.parse(jsonPayload);
                console.log('OAuth Callback: Decoded token:', decodedToken);
            } catch (e) {
                console.error('OAuth Callback: Failed to decode token:', e);
            }

            // Case: Login Success
            // Properly establish NextAuth session instead of using localStorage
            signIn('credentials', {
                accessToken,
                refreshToken,
                organizationId: searchParams.get('organizationId') || '',
                accountId: decodedToken.sub || searchParams.get('accountId') || '',
                email: decodedToken.email || '',
                name: decodedToken.name || '',
                role: decodedToken.role || '',
                redirect: false
            }).then((result) => {
                console.log('OAuth Callback: signIn result:', result);
                // Remove legacy localStorage tokens if they exist
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                // Clean URL and redirect
                router.replace('/');
            }).catch((error) => {
                console.error('OAuth Callback: signIn error:', error);
                hasProcessed.current = false; // Allow retry on error
            });
        }
        else if (isSignUpRequired && signupToken) {
            hasProcessed.current = true;
            // Case: Needs Signup
            const params = new URLSearchParams();
            if (name) params.append('name', name);
            if (email) params.append('email', email);
            params.append('signupToken', signupToken);

            router.push(`/identity?${params.toString()}`);
        } else {
            // Error or invalid
            console.error('Invalid callback params', Object.fromEntries(searchParams.entries()));
            alert('로그인 처리 중 오류가 발생했습니다.');
            router.push('/login');
        }
    }, [searchParams, router, checkAuth]);

    return (
        <Center h="100vh">
            <Stack align="center">
                <LoadingOverlay visible={true} />
                <Text mt="xl">로그인 처리 중입니다...</Text>
            </Stack>
        </Center>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CallbackContent />
        </Suspense>
    );
}
