'use client';

import { Grid, Skeleton, Stack, Group, Card } from '@mantine/core';

export function DashboardSkeleton() {
    return (
        <Stack gap="lg">
            {/* Header Skeleton */}
            <Group justify="space-between">
                <div>
                    <Skeleton height={28} width={150} mb={8} />
                    <Skeleton height={14} width={200} />
                </div>
                <Group>
                    <Skeleton height={14} width={60} />
                    <Skeleton height={36} width={250} radius="xl" />
                </Group>
            </Group>

            {/* Stats Grid Skeleton */}
            <Grid gutter="md">
                {[1, 2, 3, 4].map((i) => (
                    <Grid.Col key={i} span={{ base: 6, md: 3 }}>
                        <Card padding="lg" radius="md" withBorder>
                            <Group justify="space-between" mb="xs">
                                <Skeleton height={14} width={80} />
                                <Skeleton circle height={24} />
                            </Group>
                            <Skeleton height={28} width={100} mb="xs" />
                            <Skeleton height={12} width={120} />
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Main Content Skeleton */}
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card padding="lg" radius="md" withBorder h={400}>
                        <Skeleton height={24} width={150} mb="xl" />
                        <Stack gap="lg">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Group key={i} justify="space-between">
                                    <Group>
                                        <Skeleton circle height={40} />
                                        <div>
                                            <Skeleton height={14} width={180} mb={6} />
                                            <Skeleton height={12} width={100} />
                                        </div>
                                    </Group>
                                    <Skeleton height={12} width={60} />
                                </Group>
                            ))}
                        </Stack>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Card padding="lg" radius="md" withBorder h={200}>
                            <Skeleton height={20} width={120} mb="lg" />
                            <Stack gap="md">
                                <Skeleton height={40} width="100%" radius="md" />
                                <Skeleton height={40} width="100%" radius="md" />
                            </Stack>
                        </Card>
                        <Card padding="lg" radius="md" withBorder h={200}>
                            <Skeleton height={20} width={120} mb="lg" />
                            <Stack gap="md">
                                <Skeleton height={50} width="100%" radius="md" />
                                <Skeleton height={50} width="100%" radius="md" />
                            </Stack>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
