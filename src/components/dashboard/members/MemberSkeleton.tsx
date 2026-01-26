'use client';

import { Card, Group, Skeleton, Table, Stack } from '@mantine/core';

export function MemberTableSkeleton() {
    return (
        <Card withBorder radius="md" p={0}>
            <Table>
                <Table.Thead bg="gray.0">
                    <Table.Tr>
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <Table.Th key={i}><Skeleton height={14} width={60} /></Table.Th>
                        ))}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Table.Tr key={i}>
                            <Table.Td>
                                <Group gap="sm">
                                    <Skeleton circle height={26} />
                                    <Skeleton height={14} width={80} />
                                </Group>
                            </Table.Td>
                            <Table.Td><Skeleton height={14} width={40} /></Table.Td>
                            <Table.Td><Skeleton height={20} width={60} radius="xl" /></Table.Td>
                            <Table.Td><Skeleton height={14} width={100} /></Table.Td>
                            <Table.Td><Skeleton height={14} width={120} /></Table.Td>
                            <Table.Td><Skeleton height={14} width={80} /></Table.Td>
                            <Table.Td></Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Card>
    );
}

export function MemberDetailSkeleton() {
    return (
        <Stack gap="lg">
            <Group align="flex-start">
                <Skeleton height={80} width={80} radius="md" />
                <div style={{ flex: 1 }}>
                    <Skeleton height={24} width={150} mb={8} />
                    <Skeleton height={14} width={120} mb={8} />
                    <Skeleton height={14} width={100} />
                    <Group mt="md">
                        <Skeleton height={28} width={80} radius="sm" />
                        <Skeleton height={28} width={80} radius="sm" />
                    </Group>
                </div>
            </Group>

            <Stack gap="sm">
                <Skeleton height={20} width={150} />
                <Skeleton height={60} width="100%" radius="md" />
            </Stack>

            <Stack gap="sm">
                <Skeleton height={36} width="100%" />
                <Skeleton height={120} width="100%" radius="md" />
            </Stack>
        </Stack>
    );
}
