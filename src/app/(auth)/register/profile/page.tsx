'use client';

import { Container, Title, Text, Stack, Button, TextInput, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useState, Suspense, useEffect } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { selectIdentity } = useAuth();

    // Get collected data from URL
    const role = searchParams.get('role') as UserRole;

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        signupToken: ''
    });

    useEffect(() => {
        const name = searchParams.get('name') || '';
        const email = searchParams.get('email') || '';
        const signupToken = searchParams.get('signupToken') || '';

        setProfile(prev => ({
            ...prev,
            name,
            email,
            signupToken
        }));
    }, [searchParams]);

    const handleBack = () => {
        router.back();
    };

    const handleComplete = () => {
        if (role) {
            selectIdentity(role, profile);
        }
    };

    const isProfileValid = profile.name.length > 0 && profile.email.length > 0 && profile.phone.length > 0;

    if (!role) {
        return (
            <Stack align="center" mt={50}>
                <Text>잘못된 접근입니다. 역할을 선택해주세요.</Text>
                <Button onClick={() => router.push('/identity')}>돌아가기</Button>
            </Stack>
        );
    }

    return (
        <Stack gap="xl" align="center" w="100%" maw={400}>
            <Stack align="center" gap="xs" w="100%">
                <Group w="100%" justify="flex-start">
                    <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={handleBack} color="gray">
                        뒤로가기
                    </Button>
                </Group>
                <Title order={1}>기본 정보를 입력해주세요</Title>
                <Text c="dimmed">안전한 서비스 이용을 위해 정보가 필요합니다.</Text>
            </Stack>

            <Stack gap="md" w="100%">
                <TextInput
                    label="이름"
                    placeholder="홍길동"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.currentTarget.value })}
                />
                <TextInput
                    label="이메일"
                    placeholder="user@example.com"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.currentTarget.value })}
                // readOnly // Depending on requirements
                />
                <TextInput
                    label="휴대폰 번호"
                    placeholder="010-1234-5678"
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.currentTarget.value })}
                />
            </Stack>

            <Button size="lg" fullWidth onClick={handleComplete} disabled={!isProfileValid}>
                다음으로 이동
            </Button>
        </Stack>
    );
}

export default function ProfilePage() {
    return (
        <Container size="sm" h="100vh" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <ProfileContent />
            </Suspense>
        </Container>
    );
}
