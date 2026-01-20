import { Modal, TextInput, Select, Button, Group, Textarea, SegmentedControl } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { Member, useMembers } from '@/context/MemberContext';
import { useEffect } from 'react';
import dayjs from 'dayjs';

interface MemberFormModalProps {
    opened: boolean;
    onClose: () => void;
    member?: Member | null; // If provided, edit mode
}

export default function MemberFormModal({ opened, onClose, member }: MemberFormModalProps) {
    const { registerMember, updateMember } = useMembers();

    const form = useForm({
        initialValues: {
            name: '',
            phone: '',
            gender: 'FEMALE',
            birthDate: null as Date | null,
            pinnedNote: '',
            status: 'ACTIVE',
        },
        validate: {
            name: (value) => (value.length < 2 ? '이름은 2글자 이상이어야 합니다.' : null),
            phone: (value) => (/^\d{3}-\d{3,4}-\d{4}$/.test(value) ? null : '올바른 전화번호 형식이 아닙니다 (010-0000-0000)'),
        },
    });

    // Reset or populate form when opened/member changes
    useEffect(() => {
        if (opened) {
            if (member) {
                form.setValues({
                    name: member.name,
                    phone: member.phone,
                    gender: member.gender,
                    birthDate: member.birthDate ? new Date(member.birthDate) : null,
                    pinnedNote: member.pinnedNote || '',
                    status: member.status,
                });
            } else {
                form.reset();
            }
        }
    }, [opened, member]);

    const handleSubmit = (values: typeof form.values) => {
        const memberData = {
            name: values.name,
            phone: values.phone,
            gender: values.gender as 'MALE' | 'FEMALE',
            birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : undefined,
            pinnedNote: values.pinnedNote || undefined,
            status: values.status as any,
        };

        if (member) {
            updateMember(member.id, memberData);
        } else {
            // For new members, we don't pass status locally as 'ACTIVE' is default in context, 
            // but our form includes it. Context `registerMember` omits status/id/registeredAt.
            // Let's pass what we can. Context ignores status for new members currently 
            // but let's assume valid data.
            registerMember({
                name: memberData.name,
                phone: memberData.phone,
                gender: memberData.gender,
                birthDate: memberData.birthDate,
                pinnedNote: memberData.pinnedNote,
            });
        }
        onClose();
        form.reset();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={member ? "회원 정보 수정" : "신규 회원 등록"}
            centered
            zIndex={300}
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="이름"
                    placeholder="홍길동"
                    required
                    mb="sm"
                    {...form.getInputProps('name')}
                />
                <TextInput
                    label="전화번호"
                    placeholder="010-1234-5678"
                    required
                    mb="sm"
                    {...form.getInputProps('phone')}
                />

                <Group grow mb="sm">
                    <Select
                        label="성별"
                        data={[
                            { value: 'FEMALE', label: '여성' },
                            { value: 'MALE', label: '남성' }
                        ]}
                        {...form.getInputProps('gender')}
                    />
                    <DateInput
                        label="생년월일"
                        placeholder="YYYY-MM-DD"
                        valueFormat="YYYY-MM-DD"
                        {...form.getInputProps('birthDate')}
                    />
                </Group>

                {member && (
                    <Select
                        label="회원 상태"
                        mb="sm"
                        data={[
                            { value: 'ACTIVE', label: '활동회원 (Active)' },
                            { value: 'DORMANT', label: '휴면회원 (Dormant)' },
                            { value: 'EXPIRED', label: '만료회원 (Expired)' },
                            { value: 'PENDING', label: '대기회원 (Pending)' },
                        ]}
                        {...form.getInputProps('status')}
                    />
                )}

                <Textarea
                    label="신체 특이사항 (중요)"
                    placeholder="예: 허리 디스크, 목 통증 등"
                    minRows={3}
                    mb="lg"
                    {...form.getInputProps('pinnedNote')}
                />

                <Group justify="flex-end">
                    <Button variant="default" onClick={onClose}>취소</Button>
                    <Button type="submit">{member ? "수정 저장" : "등록하기"}</Button>
                </Group>
            </form>
        </Modal>
    );
}
