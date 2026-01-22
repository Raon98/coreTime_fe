'use client';

import {
    Title, Text, Container, SimpleGrid, Card, Group,
    RingProgress, Center, ThemeIcon, Table, Progress,
    Badge, ActionIcon, Menu, Button, Tabs, Modal,
    Select, TextInput, NumberInput
} from '@mantine/core';
import {
    IconTicket, IconAlertCircle, IconPlayerPause,
    IconCalendarTime, IconDotsVertical, IconPlus,
    IconClockPlay, IconSearch, IconFilter, IconDownload,
    IconSortDescending, IconCheck
} from '@tabler/icons-react';
import { useMembers, Ticket, Member } from '@/context/MemberContext';
import { notifications } from '@mantine/notifications';
import { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';

export default function TicketManagementPage() {
    const { tickets, members, pauseTicket, addTicket, updateTicket } = useMembers();

    // Modals
    const [registerOpened, { open: openRegister, close: closeRegister }] = useDisclosure(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

    // Edit State
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [editMode, setEditMode] = useState<'ADD_COUNT' | 'EXTEND'>('ADD_COUNT');

    // Register Form State (Simple local state)
    const [newTicketData, setNewTicketData] = useState({
        memberId: '',
        name: '1:1 PT 10회',
        totalCount: 10,
        startDate: new Date(),
        endDate: dayjs().add(1, 'year').toDate() // Default 1 year
    });

    // Edit Form State
    const [editValue, setEditValue] = useState<number | Date | null>(null); // Number for count, Date for extension

    // Stats
    const expiringSoon = tickets.filter(t => {
        const diff = dayjs(t.endDate).diff(dayjs(), 'day');
        return t.status === 'ACTIVE' && diff <= 7 && diff >= 0;
    }).length;

    const lowBalance = tickets.filter(t => t.status === 'ACTIVE' && t.remainingCount <= 3).length;
    const pausedCount = tickets.filter(t => t.status === 'PAUSED').length;

    // Helper to get member name
    const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

    // --- Filtering & Sorting ---
    const [filterType, setFilterType] = useState<string | null>('ALL'); // ALL, EXPIRING, LOW_BALANCE, PAUSED
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<string>('NAME_ASC'); // NAME_ASC, REG_DESC, REMAINING_ASC, REMAINING_DESC

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            // 1. Status Filter
            if (filterType === 'EXPIRING') {
                const diff = dayjs(t.endDate).diff(dayjs(), 'day');
                if (!(t.status === 'ACTIVE' && diff <= 7 && diff >= 0)) return false;
            } else if (filterType === 'LOW_BALANCE') {
                if (!(t.status === 'ACTIVE' && t.remainingCount <= 3)) return false;
            } else if (filterType === 'PAUSED') {
                if (t.status !== 'PAUSED') return false;
            }

            // 2. Search
            const memberName = getMemberName(t.memberId);
            if (search && !memberName.includes(search)) return false;

            return true;
        }).sort((a, b) => {
            // 3. Sorting
            if (sortOrder === 'NAME_ASC') {
                return getMemberName(a.memberId).localeCompare(getMemberName(b.memberId));
            } else if (sortOrder === 'REG_DESC') {
                // Assuming ID orStartDate is proxy for registration order - using startDate
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            } else if (sortOrder === 'REMAINING_ASC') {
                return a.remainingCount - b.remainingCount;
            } else if (sortOrder === 'REMAINING_DESC') {
                return b.remainingCount - a.remainingCount;
            }
            return 0;
        });
    }, [tickets, filterType, search, sortOrder, members]);

    const handleExcelDownload = () => {
        notifications.show({
            title: '엑셀 다운로드 시작',
            message: '수강권 목록을 엑셀 파일로 변환 중입니다...',
            color: 'green',
            icon: <IconDownload size={18} />
        });
    };

    // --- Action Handlers ---

    const handleRegister = () => {
        if (!newTicketData.memberId) {
            notifications.show({ title: '오류', message: '회원을 선택해주세요.', color: 'red' });
            return;
        }

        addTicket({
            memberId: newTicketData.memberId,
            name: newTicketData.name,
            totalCount: newTicketData.totalCount,
            remainingCount: newTicketData.totalCount,
            startDate: newTicketData.startDate,
            endDate: newTicketData.endDate,
            status: 'ACTIVE'
        });

        notifications.show({ title: '등록 완료', message: '수강권이 성공적으로 등록되었습니다.', color: 'green', icon: <IconCheck size={18} /> });
        closeRegister();
        // Reset form defaults if needed
    };

    const openEditModal = (ticket: Ticket, mode: 'ADD_COUNT' | 'EXTEND') => {
        setSelectedTicket(ticket);
        setEditMode(mode);
        setEditValue(mode === 'ADD_COUNT' ? 0 : ticket.endDate);
        openEdit();
    };

    const handleEditSubmit = () => {
        if (!selectedTicket || !editValue) return;

        if (editMode === 'ADD_COUNT') {
            const addAmt = Number(editValue);
            if (addAmt <= 0) return;
            updateTicket(selectedTicket.id, {
                totalCount: selectedTicket.totalCount + addAmt,
                remainingCount: selectedTicket.remainingCount + addAmt
            });
            notifications.show({ title: '횟수 추가 완료', message: `${addAmt}회가 추가되었습니다.`, color: 'green' });
        } else {
            // EXTEND
            const newDate = editValue as Date;
            updateTicket(selectedTicket.id, {
                endDate: newDate
            });
            notifications.show({ title: '기간 연장 완료', message: `유효기간이 ${dayjs(newDate).format('YY.MM.DD')}까지 연장되었습니다.`, color: 'green' });
        }
        closeEdit();
    };


    return (
        <Container size="xl" py="xl">
            <Title order={2} mb="lg">수강권 현황 (Ticket Management)</Title>

            {/* Top Cards (Clickable) */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mb="xl">
                <StatCard
                    label="만료 예정 (7일 이내)"
                    value={expiringSoon}
                    icon={IconCalendarTime}
                    color="red"
                    active={filterType === 'EXPIRING'}
                    onClick={() => setFilterType(filterType === 'EXPIRING' ? 'ALL' : 'EXPIRING')}
                />
                <StatCard
                    label="잔여 횟수 부족 (3회 이하)"
                    value={lowBalance}
                    icon={IconAlertCircle}
                    color="orange"
                    active={filterType === 'LOW_BALANCE'}
                    onClick={() => setFilterType(filterType === 'LOW_BALANCE' ? 'ALL' : 'LOW_BALANCE')}
                />
                <StatCard
                    label="일시 정지 회원"
                    value={pausedCount}
                    icon={IconPlayerPause}
                    color="gray"
                    active={filterType === 'PAUSED'}
                    onClick={() => setFilterType(filterType === 'PAUSED' ? 'ALL' : 'PAUSED')}
                />
            </SimpleGrid>

            {/* Controls */}
            <Group mb="md" justify="space-between">
                <Group>
                    <TextInput
                        placeholder="회원 이름 검색"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        style={{ width: 220 }}
                    />
                    <Select
                        placeholder="정렬 기준"
                        leftSection={<IconSortDescending size={16} />}
                        data={[
                            { value: 'NAME_ASC', label: '이름순' },
                            { value: 'REG_DESC', label: '최근 등록순' },
                            { value: 'REMAINING_ASC', label: '잔여 횟수 적은순' },
                            { value: 'REMAINING_DESC', label: '잔여 횟수 많은순' },
                        ]}
                        value={sortOrder}
                        onChange={(val) => setSortOrder(val || 'NAME_ASC')}
                        style={{ width: 180 }}
                    />
                    <Select
                        placeholder="상태 필터"
                        leftSection={<IconFilter size={16} />}
                        data={[
                            { value: 'ALL', label: '전체 보기' },
                            { value: 'EXPIRING', label: '만료 예정' },
                            { value: 'LOW_BALANCE', label: '잔여 부족' },
                            { value: 'PAUSED', label: '일시 정지' },
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                        style={{ width: 160 }}
                    />
                </Group>
                <Button leftSection={<IconPlus size={18} />} onClick={openRegister}>수강권 등록</Button>
            </Group>

            {/* Ticket Table */}
            <Card withBorder radius="md">
                <Group justify="space-between" mb="md">
                    <Text fw={600} size="lg">수강권 목록 ({filteredTickets.length})</Text>
                    <Button variant="light" size="xs" leftSection={<IconDownload size={14} />} onClick={handleExcelDownload}>엑셀 다운로드</Button>
                </Group>

                <Table verticalSpacing="sm">
                    <Table.Thead bg="gray.0">
                        <Table.Tr>
                            <Table.Th>회원명</Table.Th>
                            <Table.Th>수강권 명</Table.Th>
                            <Table.Th style={{ width: 200 }}>잔여 횟수</Table.Th>
                            <Table.Th>유효 기간 (D-Day)</Table.Th>
                            <Table.Th>상태</Table.Th>
                            <Table.Th style={{ width: 50 }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredTickets.map((ticket) => {
                            const daysLeft = dayjs(ticket.endDate).diff(dayjs(), 'day');
                            const isExpiring = daysLeft <= 7 && daysLeft >= 0;
                            const percent = (ticket.remainingCount / ticket.totalCount) * 100;

                            return (
                                <Table.Tr key={ticket.id}>
                                    <Table.Td>
                                        <Text fw={500} size="sm">{getMemberName(ticket.memberId)}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <IconTicket size={16} color="gray" />
                                            <Text size="sm">{ticket.name}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs" mb={4} justify="space-between">
                                            <Text size="xs" fw={700}>{ticket.remainingCount}회</Text>
                                            <Text size="xs" c="dimmed">/ {ticket.totalCount}회</Text>
                                        </Group>
                                        <Progress
                                            value={percent}
                                            size="md"
                                            radius="xl"
                                            color={percent < 20 ? 'red' : 'indigo'}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <Text size="sm" c={isExpiring ? 'red' : undefined} fw={isExpiring ? 700 : 400}>
                                                {dayjs(ticket.endDate).format('YYYY-MM-DD')}
                                            </Text>
                                            <Badge size="xs" variant="light" color={isExpiring ? 'red' : 'gray'}>
                                                D-{daysLeft < 0 ? 'Exp' : daysLeft}
                                            </Badge>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge
                                            color={ticket.status === 'ACTIVE' ? 'green' : ticket.status === 'PAUSED' ? 'orange' : 'gray'}
                                        >
                                            {ticket.status}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Menu position="bottom-end">
                                            <Menu.Target>
                                                <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconPlus size={14} />} onClick={() => openEditModal(ticket, 'ADD_COUNT')}>횟수 추가</Menu.Item>
                                                <Menu.Item leftSection={<IconClockPlay size={14} />} onClick={() => openEditModal(ticket, 'EXTEND')}>기간 연장</Menu.Item>
                                                {ticket.status === 'ACTIVE' && (
                                                    <Menu.Item
                                                        leftSection={<IconPlayerPause size={14} />}
                                                        onClick={() => pauseTicket(ticket.id, true)}
                                                    >
                                                        일시 정지
                                                    </Menu.Item>
                                                )}
                                                {ticket.status === 'PAUSED' && (
                                                    <Menu.Item
                                                        leftSection={<IconPlayerPause size={14} />}
                                                        onClick={() => pauseTicket(ticket.id, false)}
                                                    >
                                                        정지 해제
                                                    </Menu.Item>
                                                )}
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Card>

            {/* Register Modal */}
            <Modal opened={registerOpened} onClose={closeRegister} title="수강권 등록" size="md">
                <Select
                    label="회원 선택"
                    placeholder="회원을 선택하세요"
                    data={members.map(m => ({ value: m.id, label: `${m.name} (${m.phone})` }))}
                    searchable
                    mb="sm"
                    value={newTicketData.memberId}
                    onChange={(v) => setNewTicketData({ ...newTicketData, memberId: v || '' })}
                    required
                />
                <TextInput
                    label="수강권 명"
                    placeholder="예: 1:1 PT 10회"
                    mb="sm"
                    value={newTicketData.name}
                    onChange={(e) => setNewTicketData({ ...newTicketData, name: e.currentTarget.value })}
                />
                <NumberInput
                    label="총 횟수"
                    mb="sm"
                    value={newTicketData.totalCount}
                    onChange={(v) => setNewTicketData({ ...newTicketData, totalCount: Number(v) })}
                />
                <Group grow mb="lg">
                    <DatePickerInput
                        label="시작일"
                        value={newTicketData.startDate}
                        onChange={(v) => setNewTicketData({ ...newTicketData, startDate: (v as any) || new Date() })}
                    />
                    <DatePickerInput
                        label="종료일"
                        value={newTicketData.endDate}
                        onChange={(v) => setNewTicketData({ ...newTicketData, endDate: (v as any) || new Date() })}
                    />
                </Group>
                <Button fullWidth onClick={handleRegister}>등록하기</Button>
            </Modal>

            {/* Edit Modal */}
            <Modal opened={editOpened} onClose={closeEdit} title={editMode === 'ADD_COUNT' ? "횟수 추가" : "기간 연장"}>
                {selectedTicket && (
                    <>
                        <Text size="sm" mb="md" c="dimmed">
                            {getMemberName(selectedTicket.memberId)}님 - {selectedTicket.name}
                        </Text>

                        {editMode === 'ADD_COUNT' ? (
                            <NumberInput
                                label="추가할 횟수"
                                placeholder="숫자 입력"
                                mb="xl"
                                value={Number(editValue)}
                                onChange={(v) => setEditValue(Number(v))}
                                min={1}
                            />
                        ) : (
                            <DatePickerInput
                                label="변경할 종료일"
                                placeholder="날짜 선택"
                                mb="xl"
                                value={editValue instanceof Date ? editValue : null}
                                onChange={(v) => setEditValue(v as any)}
                            />
                        )}

                        <Button fullWidth onClick={handleEditSubmit}>{editMode === 'ADD_COUNT' ? '추가하기' : '연장하기'}</Button>
                    </>
                )}
            </Modal>
        </Container>
    );
}

function StatCard({ label, value, icon: Icon, color, active, onClick }: any) {
    return (
        <Card
            withBorder={!active}
            padding="lg"
            radius="md"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
            bg={active ? `${color}.0` : undefined}
            className={active ? 'active-stat-card' : undefined}
        >
            <Group justify="space-between">
                <div>
                    <Text size="xs" c={active ? `${color}.9` : "dimmed"} fw={700} tt="uppercase">
                        {label}
                    </Text>
                    <Text fw={700} size="xl" mt="xs" c={active ? `${color}.9` : undefined}>
                        {value}명
                    </Text>
                </div>
                <ThemeIcon size="xl" radius="md" variant={active ? "filled" : "light"} color={color}>
                    <Icon size={24} />
                </ThemeIcon>
            </Group>
        </Card>
    );
}
