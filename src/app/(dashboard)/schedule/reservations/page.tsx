'use client';

import { Title, Paper, Text, Group, TextInput, Select, Stack } from '@mantine/core';
import { ReservationTable } from '@/components/schedule/ReservationTable';
import { getReservations, Reservation } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { IconSearch } from '@tabler/icons-react';

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setReservations(getReservations());
    }, []);

    const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
        setReservations(prev =>
            prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
        );
    };

    const filteredData = reservations.filter(r => {
        const matchesStatus = filterStatus ? r.status === filterStatus : true;
        const matchesSearch = r.userName.includes(search) || r.classTitle.includes(search);
        return matchesStatus && matchesSearch;
    });

    return (
        <Stack gap="md" h="100%">
            <Group justify="space-between">
                <Title order={2}>예약 관리</Title>
            </Group>

            <Paper p="md" shadow="sm" radius="md">
                <Group mb="lg">
                    <TextInput
                        placeholder="회원명 또는 수업명 검색"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        style={{ flex: 1 }}
                    />
                    <Select
                        placeholder="상태 필터"
                        data={[
                            { value: 'RESERVED', label: '예약확정' },
                            { value: 'WAITING', label: '대기' },
                            { value: 'CANCELED', label: '취소' },
                        ]}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        clearable
                        style={{ width: 150 }}
                    />
                </Group>

                <ReservationTable data={filteredData} onStatusChange={handleStatusChange} />
            </Paper>
        </Stack>
    );
}
