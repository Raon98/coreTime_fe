'use client';

import { Container, Title, Text, SimpleGrid, Paper, Stack, ThemeIcon } from '@mantine/core';
import { IconBuildingStore, IconUserScreen } from '@tabler/icons-react';
import { Suspense } from 'react';
import { UserRole } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';

function IdentityContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleRoleSelect = (role: UserRole) => {
        // Construct new URL parameters
        const params = new URLSearchParams(searchParams.toString());
        if (role) {
            params.set('role', role);
        }

        router.push(`/register/profile?${params.toString()}`);
    };

    return (
        <Stack gap="xl" align="center" mb={50}>
            <Stack align="center" gap="xs">
                <Title order={1}>어떤 역할로 사용하시나요?</Title>
                <Text c="dimmed">서비스 이용을 위해 역할을 선택해주세요.</Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" w="100%">
                <IdentityCard
                    icon={<IconBuildingStore size={40} />}
                    title="센터장 (OWNER)"
                    description="센터를 직접 등록하고 강사 승인 및 운영 전반을 관리합니다."
                    onClick={() => handleRoleSelect('OWNER')}
                />
                <IdentityCard
                    icon={<IconUserScreen size={40} />}
                    title="강사 (INSTRUCTOR)"
                    description="초대 코드를 입력하여 센터에 소속되고 본인의 수업 일정을 관리합니다."
                    onClick={() => handleRoleSelect('INSTRUCTOR')}
                />
            </SimpleGrid>
        </Stack>
    );
}

export default function IdentitySelectionPage() {
    return (
        <Container size="sm" h="100vh" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Suspense fallback={<div>Loading...</div>}>
                <IdentityContent />
            </Suspense>
        </Container>
    );
}

interface IdentityCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

function IdentityCard({ icon, title, description, onClick }: IdentityCardProps) {
    return (
        <Paper
            p="xl"
            radius="md"
            withBorder
            onClick={onClick}
            style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
            // Add hover effect via sx or style
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--mantine-color-indigo-6)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)'; // default border color
            }}
        >
            <Stack align="center" gap="md">
                <ThemeIcon
                    size={80}
                    radius="full"
                    variant="light"
                    color="indigo"
                >
                    {icon}
                </ThemeIcon>
                <Title order={3} size="h4">{title}</Title>
                <Text size="sm" c="dimmed" ta="center" style={{ lineHeight: 1.6 }}>
                    {description}
                </Text>
            </Stack>
        </Paper>
    )
}
