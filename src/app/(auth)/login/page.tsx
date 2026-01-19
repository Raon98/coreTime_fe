'use client';

import { Container, Paper, Title, Text, Button, Group, Stack, Center, Box } from '@mantine/core';
import { IconMessageCircle, IconBrandGoogle, IconBarbell } from '@tabler/icons-react'; // Using icons for now, customize later
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <Container size="xs" h="100vh" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper radius="lg" p="xl" withBorder w="100%" shadow="sm">
                <Center mb="lg">
                    <ThemeIconVariant />
                </Center>
                <Stack gap="xs" mb="xl" align="center">
                    <Title order={2} ta="center">CoreTime</Title>
                    <Text c="dimmed" size="sm" ta="center">스마트한 센터 관리의 시작</Text>
                </Stack>

                <Stack gap="md">
                    <Button
                        fullWidth
                        color="#FEE500"
                        c="#000"
                        leftSection={<IconMessageCircle size={20} />}
                        onClick={() => login('kakao')}
                        styles={{
                            root: { border: 'none' },
                            label: { fontWeight: 500 }
                        }}
                    >
                        카카오로 시작하기
                    </Button>

                    <Button
                        fullWidth
                        variant="default"
                        leftSection={<IconBrandGoogle size={20} />}
                        onClick={() => login('google')}
                        styles={{
                            label: { fontWeight: 500 }
                        }}
                    >
                        구글로 시작하기
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

function ThemeIconVariant() {
    return (
        <Box
            w={60} h={60}
            bg="indigo.0"
            style={{ borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <IconBarbell size={32} color="var(--mantine-color-indigo-6)" />
        </Box>
    )
}
