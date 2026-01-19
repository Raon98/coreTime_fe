'use client';

import { useState } from 'react';
import { Title, Container, Grid, SegmentedControl, Group, Text, Box, Stack } from '@mantine/core';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { InstructorApprovalList } from '@/components/dashboard/InstructorApprovalList';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CenterAlerts } from '@/components/dashboard/CenterAlerts';
import {
    UserRole,
    getMockStats,
    getPendingInstructors,
    getRecentActivity,
    getCenterAlerts
} from '@/lib/mock-data';

export default function DashboardPage() {
    const [role, setRole] = useState<UserRole>('OWNER');

    // Load mock data
    const stats = getMockStats();
    const pendingInstructors = getPendingInstructors();
    const activities = getRecentActivity(role);
    const alerts = getCenterAlerts();

    return (
        <Container fluid p="md">
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>대시보드</Title>
                    <Text c="dimmed" size="sm">
                        반갑습니다, {role === 'OWNER' ? '맹성철 원장님' : '김필라 강사님'}
                    </Text>
                </div>
                <Group>
                    <Text size="sm" fw={500}>View as:</Text>
                    <SegmentedControl
                        value={role}
                        onChange={(value) => setRole(value as UserRole)}
                        data={[
                            { label: '센터장(Owner)', value: 'OWNER' },
                            { label: '강사(Instructor)', value: 'INSTRUCTOR' },
                        ]}
                    />
                </Group>
            </Group>

            {/* 1. Top Stats Grid */}
            <Box mb="lg">
                <StatsGrid role={role} data={stats} />
            </Box>

            {/* 2. Main Content Grid */}
            <Grid gutter="lg">

                {/* Left/Main Column */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    {/* Activity Log takes the main stage now */}
                    <RecentActivity activities={activities} />
                </Grid.Col>

                {/* Right/Side Column */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        {role === 'OWNER' ? (
                            <>
                                <InstructorApprovalList instructors={pendingInstructors} />
                                <CenterAlerts alerts={alerts} />
                            </>
                        ) : (
                            <CenterAlerts alerts={alerts} />
                        )}
                    </Stack>
                </Grid.Col>

            </Grid>
        </Container>
    );
}
