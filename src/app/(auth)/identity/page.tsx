'use client';

import { Container, Title, Text, SimpleGrid, Paper, Stack, ThemeIcon, Button, Group } from '@mantine/core';
import { IconBuildingStore, IconUserScreen } from '@tabler/icons-react';
import { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import classes from './Identity.module.css'; // Will create CSS module for hover effects if needed, or use sx

export default function IdentitySelectionPage() {
    const [selected, setSelected] = useState<UserRole>(null);
    const { selectIdentity } = useAuth();

    const handleContinue = () => {
        if (selected) selectIdentity(selected);
    };

    return (
        <Container size="sm" h="100vh" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack gap="xl" align="center" mb={50}>
                <Title order={1}>어떤 역할로 사용하시나요?</Title>
                <Text c="dimmed">서비스 이용을 위해 역할을 선택해주세요.</Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <IdentityCard
                    icon={<IconBuildingStore size={40} />}
                    title="센터장 (OWNER)"
                    description="센터를 직접 등록하고 강사 승인 및 운영 전반을 관리합니다."
                    selected={selected === 'OWNER'}
                    onClick={() => setSelected('OWNER')}
                />
                <IdentityCard
                    icon={<IconUserScreen size={40} />}
                    title="강사 (INSTRUCTOR)"
                    description="초대 코드를 입력하여 센터에 소속되고 본인의 수업 일정을 관리합니다."
                    selected={selected === 'INSTRUCTOR'}
                    onClick={() => setSelected('INSTRUCTOR')}
                />
            </SimpleGrid>

            <Center mt={40}>
                <Button
                    size="lg"
                    disabled={!selected}
                    onClick={handleContinue}
                    w={200}
                >
                    선택한 신분으로 시작하기
                </Button>
            </Center>
        </Container>
    );
}

import { Center } from '@mantine/core';

interface IdentityCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

function IdentityCard({ icon, title, description, selected, onClick }: IdentityCardProps) {
    return (
        <Paper
            p="xl"
            radius="md"
            withBorder
            onClick={onClick}
            style={{
                cursor: 'pointer',
                borderColor: selected ? 'var(--mantine-color-indigo-6)' : undefined,
                backgroundColor: selected ? 'var(--mantine-color-indigo-0)' : undefined,
                borderWidth: selected ? '2px' : '1px',
                transition: 'all 0.2s ease'
            }}
        >
            <Stack align="center" gap="md">
                <ThemeIcon
                    size={80}
                    radius="full"
                    variant={selected ? 'filled' : 'light'}
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
