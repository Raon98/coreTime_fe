
'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LoadingOverlay, Text, Center, Stack } from '@mantine/core';


const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('JWT Decoding Failed:', e);
        return null;
    }
};

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const signupToken = searchParams.get('signupToken');
        const isSignUpRequired = searchParams.get('isSignUpRequired') === 'true';

        if (accessToken && refreshToken) {
            hasProcessed.current = true;

            // 1. https://www.imdb.com/title/tt10023022/ 즉시 주소창에서 토큰 제거 (뒤로가기 방지 및 보안)
            window.history.replaceState({}, '', '/');

            // 2. [Safe Decode] 안정적인 JWT 파싱
            const decodedToken = parseJwt(accessToken);
            if (!decodedToken) {
                alert('인증 토큰 형식이 올바르지 않습니다.');
                router.replace('/login');
                return;
            }

            // 3. [NextAuth Login] 세션 수립
            signIn('credentials', {
                accessToken,
                refreshToken,
                organizationId: searchParams.get('organizationId') || '',
                accountId: decodedToken.sub || '',
                email: decodedToken.email || '',
                name: decodedToken.name || '',
                role: decodedToken.role || '',
                redirect: false // 미들웨어에서 리다이렉트를 관리하므로 false 권장
            }).then((result) => {
                if (result?.error) {
                    console.error('NextAuth Login Error:', result.error);
                    router.replace('/login?error=auth_failed');
                } else {
                    // 성공 시 대시보드 강제 새로고침(세션 반영) 및 이동
                    router.refresh();
                    router.replace('/');
                }
            });
        }
        else if (isSignUpRequired && signupToken) {
            hasProcessed.current = true;
            const params = new URLSearchParams({
                signupToken,
                name: searchParams.get('name') || '',
                email: searchParams.get('email') || ''
            });
            router.replace(`/identity?${params.toString()}`);
        } else {
            console.error('Invalid callback params');
            router.replace('/login');
        }
    }, [searchParams, router]);

    return (
        <Center h="100vh">
            <Stack align="center">
                <LoadingOverlay visible={true} overlayProps={{ blur: 2 }} />
                <Text mt="xl" fw={500}>인증 정보를 확인 중입니다...</Text>
            </Stack>
        </Center>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={<LoadingOverlay visible />}>
            <CallbackContent />
        </Suspense>
    );
}
