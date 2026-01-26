'use client';

import { Paper, Text, Avatar, Group, Button, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { User } from '@/lib/mock-data';
import { InstructorDto } from '@/lib/api';

// Union type to support both mock and real API data during transition
type Instructor = User | InstructorDto;

interface InstructorApprovalListProps {
    instructors: Instructor[];
}

export function InstructorApprovalList({ instructors }: InstructorApprovalListProps) {
    if (instructors.length === 0) {
        return (
            <Paper withBorder p="md" radius="md" h="100%">
                <Text fw={700} mb="md">강사 승인 대기</Text>
                <Text c="dimmed" size="sm">승인 대기 중인 강사가 없습니다.</Text>
            </Paper>
        );
    }

    const items = instructors.map((user) => {
        // Handle different ID fields
        const id = 'id' in user ? user.id : user.membershipId;
        // Handle optional avatar
        const avatarUrl = 'avatarUrl' in user ? user.avatarUrl : undefined;

        return (
            <Group key={id} justify="space-between" wrap="nowrap">
                <Group gap="sm">
                    <Avatar src={avatarUrl} radius="xl" size="md" />
                    <div>
                        <Text size="sm" fw={500}>{user.name}</Text>
                        <Text c="dimmed" size="xs">{user.email}</Text>
                    </div>
                </Group>
                <Button variant="light" color="teal" size="xs" leftSection={<IconCheck size={14} />}>
                    승인
                </Button>
            </Group>
        );
    });

    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Text fw={700} mb="md">강사 승인 요청</Text>
            <Stack gap="md">
                {items}
            </Stack>
        </Paper>
    );
}
