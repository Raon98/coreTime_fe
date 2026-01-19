'use client';

import { Paper, Text, Timeline, ThemeIcon } from '@mantine/core';
import { IconCash, IconCalendar, IconUserCheck, IconUserPlus, IconBell } from '@tabler/icons-react';
import { ActivityLog } from '@/lib/mock-data';

interface RecentActivityProps {
    activities: ActivityLog[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    const getIcon = (type: ActivityLog['type']) => {
        switch (type) {
            case 'PAYMENT': return <IconCash size={12} />;
            case 'RESERVATION': return <IconCalendar size={12} />;
            case 'ATTENDANCE': return <IconUserCheck size={12} />;
            case 'NEW_MEMBER': return <IconUserPlus size={12} />;
            default: return <IconBell size={12} />;
        }
    };

    const getColor = (type: ActivityLog['type']) => {
        switch (type) {
            case 'PAYMENT': return 'teal';
            case 'RESERVATION': return 'blue';
            case 'ATTENDANCE': return 'green';
            case 'NEW_MEMBER': return 'grape';
            default: return 'gray';
        }
    };

    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Text fw={700} mb="xl">최근 활동 로그</Text>
            <Timeline active={activities.length} bulletSize={24} lineWidth={2}>
                {activities.map((activity) => (
                    <Timeline.Item
                        key={activity.id}
                        bullet={getIcon(activity.type)}
                        color={getColor(activity.type)}
                        title={
                            <Text size="sm" fw={500}>{activity.message}</Text>
                        }
                    >
                        <Text c="dimmed" size="xs">
                            {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {activity.meta?.value && ` • ${activity.meta.value}`}
                        </Text>
                    </Timeline.Item>
                ))}
            </Timeline>
        </Paper>
    );
}
