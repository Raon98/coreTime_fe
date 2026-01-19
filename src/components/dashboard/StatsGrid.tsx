'use client';

import { Group, Paper, SimpleGrid, Text, ThemeIcon, RingProgress, Center, Stack } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconCoin, IconUserPlus, IconCalendarEvent, IconUsers } from '@tabler/icons-react';
import { DashboardStats, UserRole } from '@/lib/mock-data';
import { Sparkline } from '@mantine/charts';

interface StatsGridProps {
    role: UserRole;
    data: DashboardStats;
}

export function StatsGrid({ role, data }: StatsGridProps) {
    const stats = [];

    // 1. Revenue (Owner Only)
    if (role === 'OWNER') {
        stats.push(
            <Paper withBorder p="md" radius="md" key="revenue">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        이번달 매출
                    </Text>
                    <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                        <IconCoin style={{ width: 22, height: 22 }} />
                    </ThemeIcon>
                </Group>

                <Group align="flex-end" gap="xs" mt={25}>
                    <Text fw={800} size="xl">
                        {data.revenue.total.toLocaleString()} 원
                    </Text>
                </Group>

                <Text c="dimmed" size="xs" mt="sm">
                    지난 7일 추이
                </Text>
                <Sparkline
                    w="100%"
                    h={60}
                    data={data.revenue.last7Days}
                    curveType="monotone"
                    color="teal"
                    fillOpacity={0.1}
                    strokeWidth={2}
                />
            </Paper>
        );
    }

    // 2. Attendance (Common)
    stats.push(
        <Paper withBorder p="md" radius="md" key="attendance">
            <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    출석률
                </Text>
                <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                    <IconUsers style={{ width: 22, height: 22 }} />
                </ThemeIcon>
            </Group>

            <Group>
                <RingProgress
                    size={80}
                    roundCaps
                    thickness={8}
                    sections={[{ value: data.attendance.rate, color: 'blue' }]}
                    label={
                        <Center>
                            <IconArrowUpRight style={{ width: 20, height: 20 }} stroke={1.5} />
                        </Center>
                    }
                />
                <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        {data.attendance.attended} / {data.attendance.totalClasses} 명 출석
                    </Text>
                    <Text fw={800} size="xl">
                        {data.attendance.rate}%
                    </Text>
                </div>
            </Group>
        </Paper>
    );

    // 3. New Members (Owner Only)
    if (role === 'OWNER') {
        stats.push(
            <Paper withBorder p="md" radius="md" key="newMembers">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        신규 등록
                    </Text>
                    <ThemeIcon color="grape" variant="light" size="lg" radius="md">
                        <IconUserPlus style={{ width: 22, height: 22 }} />
                    </ThemeIcon>
                </Group>

                <Group align="flex-end" gap="xs" mt={25}>
                    <Text fw={800} size="xl">{data.newMembers.count} 명</Text>
                    <Text c={data.newMembers.diff > 0 ? 'teal' : 'red'} size="sm" fw={600}>
                        <span>{data.newMembers.diff > 0 ? '+' : ''}{data.newMembers.diff}</span>
                    </Text>
                </Group>
                <Text size="xs" c="dimmed" mt={7}>
                    어제 대비
                </Text>
            </Paper>
        );
    }

    // 4. My Classes (Instructor Only)
    if (role === 'INSTRUCTOR') {
        stats.push(
            <Paper withBorder p="md" radius="md" key="myClasses">
                <Group justify="space-between">
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        내 수업 일정
                    </Text>
                    <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                        <IconCalendarEvent style={{ width: 22, height: 22 }} />
                    </ThemeIcon>
                </Group>

                <Group align="flex-end" gap="xs" mt={25}>
                    <Text fw={800} size="xl">{data.instructorClasses.todayCount}개 클래스</Text>
                </Group>
                <Text size="xs" c="dimmed" mt={7}>
                    이번 주 {data.instructorClasses.upcoming}개 예정
                </Text>
            </Paper>
        );
    }

    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            {stats}
        </SimpleGrid>
    );
}
