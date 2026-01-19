'use client';

import { Title, Paper, Text, Accordion, Group, Badge, Switch, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import { getReservations, getWeeklySchedule, ClassSession, Reservation } from '@/lib/mock-data';
import dayjs from 'dayjs';
import { AttendanceList } from '@/components/schedule/AttendanceList';

export default function AttendancePage() {
    // 1. Get Today's Classes
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [autoDeduct, setAutoDeduct] = useState(true);

    useEffect(() => {
        // Mock: fetch today's schedule
        // Base Monday for mock data
        const today = new Date('2026-01-19T00:00:00');
        const weekSchedule = getWeeklySchedule(today);
        setClasses(weekSchedule.filter(c => dayjs(c.startTime).isSame(dayjs(today), 'day')));

        // Mock: fetch reservations
        setReservations(getReservations());
    }, []);

    const handleAttendanceChange = (resId: string, status: string) => {
        setReservations(prev =>
            prev.map(r => r.id === resId ? { ...r, attendanceStatus: status as any } : r)
        );
    };

    return (
        <Stack gap="md" h="100%">
            <Group justify="space-between">
                <Title order={2}>출석 체크</Title>
                <Switch
                    label="노쇼(No-Show) 자동 차감"
                    checked={autoDeduct}
                    onChange={(event) => setAutoDeduct(event.currentTarget.checked)}
                    color="red"
                />
            </Group>

            <Paper p="md" shadow="sm" radius="md">
                <Text mb="md" size="sm" c="dimmed">{dayjs().format('YYYY년 MM월 DD일')} 수업 목록</Text>

                <Accordion variant="separated">
                    {classes.map((cls) => {
                        const classReservations = reservations.filter(r => r.classId === cls.id && r.status === 'RESERVED');

                        return (
                            <Accordion.Item key={cls.id} value={cls.id}>
                                <Accordion.Control>
                                    <Group justify="space-between">
                                        <Group>
                                            <Badge color={cls.color} variant="light">{cls.roomName}</Badge>
                                            <Text fw={500}>{cls.title}</Text>
                                            <Text size="sm" c="dimmed">
                                                {dayjs(cls.startTime).format('HH:mm')} - {dayjs(cls.endTime).format('HH:mm')}
                                            </Text>
                                        </Group>
                                        <Group gap="xs">
                                            <Text size="sm">{cls.instructorName}</Text>
                                            <Badge variant="outline" color="gray">{classReservations.length} / {cls.maxCapacity}명</Badge>
                                        </Group>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <AttendanceList
                                        reservations={classReservations}
                                        onAttendanceChange={handleAttendanceChange}
                                    />
                                    {classReservations.length === 0 && (
                                        <Text c="dimmed" size="sm" ta="center" py="md">예약된 회원이 없습니다.</Text>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>

                {classes.length === 0 && (
                    <Text ta="center" py="xl" c="dimmed">오늘 예정된 수업이 없습니다.</Text>
                )}
            </Paper>
        </Stack>
    );
}
