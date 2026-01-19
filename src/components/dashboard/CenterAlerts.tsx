'use client';

import { Paper, Text, Stack, Alert, Group, Badge, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconCake, IconCreditCard } from '@tabler/icons-react';
import { CenterAlert } from '@/lib/mock-data';

interface CenterAlertsProps {
    alerts: CenterAlert[];
}

export function CenterAlerts({ alerts }: CenterAlertsProps) {
    if (alerts.length === 0) {
        return (
            <Paper withBorder p="md" radius="md" h="100%">
                <Text fw={700} mb="md">알림 센터</Text>
                <Text c="dimmed" size="sm">새로운 알림이 없습니다.</Text>
            </Paper>
        );
    }

    const getIcon = (type: CenterAlert['type']) => {
        switch (type) {
            case 'PAYMENT': return <IconCreditCard size={16} />;
            case 'BIRTHDAY': return <IconCake size={16} />;
            default: return <IconAlertCircle size={16} />;
        }
    };

    const getColor = (type: CenterAlert['type']) => {
        switch (type) {
            case 'PAYMENT': return 'red';
            case 'BIRTHDAY': return 'blue';
            case 'EXPIRY': return 'orange';
            default: return 'gray';
        }
    };

    return (
        <Paper withBorder p="md" radius="md" h="100%">
            <Text fw={700} mb="md">알림 센터</Text>
            <Stack gap="sm">
                {alerts.map((alert) => (
                    <Paper key={alert.id} withBorder p="sm" radius="sm" style={{ borderColor: `var(--mantine-color-${getColor(alert.type)}-2)`, backgroundColor: `var(--mantine-color-${getColor(alert.type)}-0)` }}>
                        <Group justify="space-between" mb={4}>
                            <Group gap="xs">
                                <ThemeIcon color={getColor(alert.type)} variant="light" size="sm">
                                    {getIcon(alert.type)}
                                </ThemeIcon>
                                <Text size="sm" fw={600} c={`${getColor(alert.type)}.9`}>
                                    {alert.type}
                                </Text>
                            </Group>
                            <Badge size="xs" color={getColor(alert.type)} variant="outline">{alert.severity}</Badge>
                        </Group>
                        <Text size="sm" mt="xs">{alert.message}</Text>
                        {alert.details && <Text size="xs" c="dimmed">{alert.details}</Text>}
                    </Paper>
                ))}
            </Stack>
        </Paper>
    );
}
