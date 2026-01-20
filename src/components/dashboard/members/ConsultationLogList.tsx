import { Stack, Button, Text, Group, Card, Textarea, Avatar, Badge, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ConsultationLog, useMembers } from '@/context/MemberContext';
import { IconPlus, IconMessageCircle } from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';

interface ConsultationLogListProps {
    memberId: string;
}

export default function ConsultationLogList({ memberId }: ConsultationLogListProps) {
    const { logs, addLog } = useMembers(); // In real app, might want to fetch logs for this user
    const [isAdding, setIsAdding] = useState(false);

    // Filter logs for this member
    const memberLogs = logs.filter(l => l.memberId === memberId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const form = useForm({
        initialValues: {
            content: '',
            type: 'GENERAL', // Just a simplified tag usage for now
        },
        validate: {
            content: (value) => (value.trim().length > 0 ? null : '내용을 입력해주세요.'),
        },
    });

    const handleSubmit = (values: typeof form.values) => {
        addLog({
            memberId,
            instructorId: 'INS_CURRENT', // Mock current user
            instructorName: 'Current Instructor', // Mock current user name
            content: values.content,
            tags: [values.type === 'GENERAL' ? '#상담' : '#운동'], // Simple tagging
        });
        setIsAdding(false);
        form.reset();
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Text fw={600}>상담/관리 기록 ({memberLogs.length})</Text>
                <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? '취소' : '기록 추가'}
                </Button>
            </Group>

            {isAdding && (
                <Card withBorder radius="md" bg="gray.0">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Select
                            size="xs"
                            mb="xs"
                            data={['GENERAL', 'EXERCISE']}
                            defaultValue="GENERAL"
                            style={{ maxWidth: 120 }}
                            {...form.getInputProps('type')}
                        />
                        <Textarea
                            placeholder="상담 내용을 입력하세요..."
                            minRows={3}
                            mb="xs"
                            autoFocus
                            {...form.getInputProps('content')}
                        />
                        <Group justify="flex-end">
                            <Button size="xs" type="submit">저장</Button>
                        </Group>
                    </form>
                </Card>
            )}

            {memberLogs.length > 0 ? (
                memberLogs.map(log => (
                    <Card key={log.id} withBorder radius="md" p="md">
                        <Group justify="space-between" align="start" mb={4}>
                            <Group gap="xs">
                                <Avatar size="sm" radius="xl" color="blue" name={log.instructorName} />
                                <Text size="sm" fw={600}>{log.instructorName}</Text>
                                {log.tags.map(tag => (
                                    <Badge key={tag} size="xs" variant="dot" color="gray">{tag}</Badge>
                                ))}
                            </Group>
                            <Text size="xs" c="dimmed">
                                {dayjs(log.date).format('YYYY-MM-DD HH:mm')}
                            </Text>
                        </Group>
                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{log.content}</Text>
                    </Card>
                ))
            ) : (
                !isAdding && (
                    <Stack align="center" py="xl" c="dimmed">
                        <IconMessageCircle size={32} stroke={1.5} />
                        <Text size="sm">아직 상담 기록이 없습니다.</Text>
                    </Stack>
                )
            )}
        </Stack>
    );
}
