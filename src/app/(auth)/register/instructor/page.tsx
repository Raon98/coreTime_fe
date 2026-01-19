'use client';

import { Container, Paper, Title, Text, Stack, PinInput, Group, Button, Card, Badge, ThemeIcon, Transition } from '@mantine/core';
import { useState } from 'react';
import { IconCheck, IconX, IconBuilding } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterInstructorPage() {
    const { registerInstructor } = useAuth();
    const [code, setCode] = useState('');
    const [foundOrg, setFoundOrg] = useState<string | null>(null);
    const [error, setError] = useState(false);

    const handleCodeChange = (value: string) => {
        setCode(value);
        setError(false);

        // Mock lookup
        if (value.length >= 6) {
            if (value === '123456') {
                setFoundOrg('코어 필라테스 강남점');
            } else if (value.length === 6) {
                // If it's a full 6 digit code but not the test one, show error or not found
                // let's just pretend only 123456 works for demo
                setFoundOrg(null);
            }
        } else {
            setFoundOrg(null);
        }
    };

    const handleSubmit = () => {
        if (foundOrg) {
            registerInstructor(code);
        } else {
            setError(true);
        }
    };

    return (
        <Container size="sm" h="100vh" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Stack align="center" gap="xl" w="100%" maw={400}>
                <Stack align="center" gap="xs">
                    <Title order={2}>초대 코드를 입력하세요</Title>
                    <Text c="dimmed" size="sm">센터장님에게 전달받은 6자리 숫자입니다.</Text>
                </Stack>

                <PinInput
                    length={6}
                    size="xl"
                    type="number"
                    value={code}
                    onChange={handleCodeChange}
                    error={error}
                    oneTimeCode
                />

                <Transition mounted={!!foundOrg} transition="slide-up" duration={400} timingFunction="ease">
                    {(styles) => (
                        <Card withBorder padding="lg" radius="md" style={styles} w="100%" bg="blue.0">
                            <Stack gap="sm" align="center">
                                <ThemeIcon color="blue" variant="light" size="lg" radius="xl">
                                    <IconBuilding size={18} />
                                </ThemeIcon>
                                <Text size="sm" ta="center">
                                    가입하시려는 센터가<br />
                                    <Text span fw={700} size="md">{foundOrg}</Text><br />
                                    맞나요?
                                </Text>
                            </Stack>
                        </Card>
                    )}
                </Transition>

                {error && (
                    <Text c="red" size="sm">코드를 다시 확인해 주세요</Text>
                )}

                <Button
                    fullWidth
                    size="lg"
                    disabled={!foundOrg}
                    onClick={handleSubmit}
                >
                    가입 신청
                </Button>
            </Stack>
        </Container>
    );
}
