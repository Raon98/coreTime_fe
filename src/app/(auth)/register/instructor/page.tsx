'use client';

import { Container, Paper, Title, Text, Stack, PinInput, Group, Button, Card, Badge, ThemeIcon, Transition, Divider, Modal, TextInput, ScrollArea, Avatar, UnstyledButton } from '@mantine/core';
import { useState } from 'react';
import { IconCheck, IconX, IconBuilding, IconSearch, IconChevronRight } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useDisclosure } from '@mantine/hooks';

// Mock Center Data
const MOCK_CENTERS = [
    { id: 'center_1', name: '코어 필라테스 강남점', address: '서울 강남구 테헤란로 123' },
    { id: 'center_2', name: '바디 밸런스 역삼점', address: '서울 강남구 논현로 456' },
    { id: 'center_3', name: '퓨어 요가 & 필라테스', address: '서울 서초구 서초대로 789' },
    { id: 'center_4', name: '올바른 필라테스', address: '서울 송파구 올림픽로 111' },
];

export default function RegisterInstructorPage() {
    const { registerInstructor } = useAuth();
    const [code, setCode] = useState('');
    const [foundOrg, setFoundOrg] = useState<string | null>(null);
    const [error, setError] = useState(false);

    // Search related state
    const [opened, { open, close }] = useDisclosure(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCenter, setSelectedCenter] = useState<{ id: string, name: string, address: string } | null>(null);

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

    const handleSubmitCode = () => {
        if (foundOrg) {
            registerInstructor(code);
        } else {
            setError(true);
        }
    };

    // Filter centers
    const filteredCenters = MOCK_CENTERS.filter(center =>
        center.name.includes(searchQuery) || center.address.includes(searchQuery)
    );

    const handleRequestApproval = () => {
        if (selectedCenter) {
            registerInstructor(null, selectedCenter.id);
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
                    onClick={handleSubmitCode}
                >
                    가입 신청
                </Button>

                <Divider label="또는" labelPosition="center" w="100%" />

                <Text size="sm" c="dimmed">
                    초대 코드가 없으신가요?
                </Text>
                <Button variant="light" color="indigo" fullWidth onClick={open}>
                    센터 검색하여 승인 요청하기
                </Button>
            </Stack>

            {/* Center Search Modal */}
            <Modal opened={opened} onClose={close} title="센터 검색" size="md" centered>
                <Stack>
                    <TextInput
                        placeholder="센터명 또는 주소 검색"
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        data-autofocus
                    />

                    <ScrollArea h={300} type="always">
                        <Stack gap="sm">
                            {filteredCenters.map(center => (
                                <UnstyledButton
                                    key={center.id}
                                    onClick={() => setSelectedCenter(center)}
                                    p="md"
                                    style={(theme) => ({
                                        borderRadius: theme.radius.md,
                                        border: `1px solid ${selectedCenter?.id === center.id ? 'var(--mantine-color-indigo-6)' : 'var(--mantine-color-gray-3)'}`,
                                        backgroundColor: selectedCenter?.id === center.id ? 'var(--mantine-color-indigo-0)' : 'transparent',
                                        transition: 'all 0.2s'
                                    })}
                                >
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="sm" wrap="nowrap">
                                            <Avatar color="indigo" radius="xl">
                                                <IconBuilding size={20} />
                                            </Avatar>
                                            <Stack gap={2}>
                                                <Text size="sm" fw={500}>{center.name}</Text>
                                                <Text size="xs" c="dimmed">{center.address}</Text>
                                            </Stack>
                                        </Group>
                                        {selectedCenter?.id === center.id && <IconCheck size={18} color="var(--mantine-color-indigo-6)" />}
                                    </Group>
                                </UnstyledButton>
                            ))}
                            {filteredCenters.length === 0 && (
                                <Text ta="center" c="dimmed" py="xl">검색 결과가 없습니다.</Text>
                            )}
                        </Stack>
                    </ScrollArea>

                    <Button
                        fullWidth
                        disabled={!selectedCenter}
                        onClick={handleRequestApproval}
                    >
                        승인 요청 보내기
                    </Button>
                </Stack>
            </Modal>
        </Container>
    );
}
