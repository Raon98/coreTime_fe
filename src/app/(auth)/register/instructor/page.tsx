'use client';

import { Container, Title, Text, Stack, PinInput, Button, Card, ThemeIcon, Transition, Divider, Modal, TextInput, ScrollArea, Avatar, UnstyledButton, Group } from '@mantine/core'; // Added Group
import { useState } from 'react';
import { IconCheck, IconBuilding, IconSearch } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useDisclosure } from '@mantine/hooks';
import { authApi } from '@/lib/api';

export default function RegisterInstructorPage() {
    const { registerInstructor, registrationData } = useAuth();
    const [code, setCode] = useState('');
    const [foundOrg, setFoundOrg] = useState<string | null>(null);
    const [error, setError] = useState(false);

    // Search related state
    const [opened, { open, close }] = useDisclosure(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [organizationList, setOrganizationList] = useState<{ id: number, name: string, address: string }[]>([]);
    const [selectedCenter, setSelectedCenter] = useState<{ id: number, name: string, address: string } | null>(null);

    const handleCodeChange = async (value: string) => {
        setCode(value);
        setError(false);

        if (value.length === 6) {
            try {
                const result = await authApi.validateInviteCode(value);
                if (result.valid) {
                    setFoundOrg(result.organizationName);
                } else {
                    setFoundOrg(null);
                }
            } catch (e) {
                console.error(e);
                setFoundOrg(null);
            }
        } else {
            setFoundOrg(null);
        }
    };

    const handleSubmitCode = () => {
        if (foundOrg && registrationData && registrationData.name && registrationData.email) {
            registerInstructor({
                name: registrationData.name,
                email: registrationData.email,
                phone: registrationData.phone,
                inviteCode: code
            });
        } else {
            setError(true);
            if (!registrationData?.name) alert('회원 정보가 없습니다. 다시 로그인해주세요.');
        }
    };

    // Fetch centers when modal opens
    const handleOpenSearch = async () => {
        open();
        try {
            const orgs = await authApi.getOrganizations();
            // Map API response to local state if needed, or just use it directly
            // OrganizationDto: { id, name, address, ... }
            setOrganizationList(orgs as any); // Type assertion or simple mapping
        } catch (error) {
            console.error('Failed to fetch organizations', error);
            // Fallback or alert?
            // setOrganizationList([]); 
        }
    };

    // Filter centers
    const filteredCenters = organizationList.filter(center =>
        center.name.includes(searchQuery) || center.address.includes(searchQuery)
    );

    const handleRequestApproval = () => {
        if (selectedCenter && registrationData && registrationData.name && registrationData.email) {
            registerInstructor({
                name: registrationData.name,
                email: registrationData.email,
                phone: registrationData.phone,
                organizationId: selectedCenter.id
            });
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
                <Button variant="light" color="indigo" fullWidth onClick={handleOpenSearch}>
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
