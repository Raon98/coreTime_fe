'use client';

import { Table, SegmentedControl, Avatar, Group, Text, Badge } from '@mantine/core';
import { Reservation } from '@/lib/mock-data';

interface AttendanceListProps {
    reservations: Reservation[];
    onAttendanceChange: (id: string, status: string) => void;
}

export function AttendanceList({ reservations, onAttendanceChange }: AttendanceListProps) {
    const rows = reservations.map((r) => (
        <Table.Tr key={r.id}>
            <Table.Td>
                <Group gap="sm">
                    {/* Fake avatar randomizer based on name char */}
                    <Avatar size="sm" radius="xl" color="blue">{r.userName.charAt(0)}</Avatar>
                    <Text size="sm" fw={500}>{r.userName}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge variant="dot" color={r.status === 'RESERVED' ? 'green' : 'gray'}>
                    {r.status === 'RESERVED' ? '예약됨' : '취소/대기'}
                </Badge>
            </Table.Td>
            <Table.Td style={{ textAlign: 'right' }}>
                <SegmentedControl
                    size="xs"
                    value={r.attendanceStatus || 'NONE'}
                    onChange={(val) => onAttendanceChange(r.id, val)}
                    data={[
                        { label: '미처리', value: 'NONE' },
                        { label: '출석', value: 'PRESENT' },
                        { label: '지각', value: 'LATE' },
                        { label: '결석', value: 'ABSENT' },
                    ]}
                    color={
                        r.attendanceStatus === 'PRESENT' ? 'teal' :
                            r.attendanceStatus === 'LATE' ? 'orange' :
                                r.attendanceStatus === 'ABSENT' ? 'red' : 'gray'
                    }
                />
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>회원</Table.Th>
                    <Table.Th>예약 상태</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>출결 처리</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}
