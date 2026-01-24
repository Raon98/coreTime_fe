'use client';

import { Container, Title, Text, Stack, TextInput, Button, Paper, Grid, LoadingOverlay } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { authApi } from '@/lib/api'; // Import authApi

export default function RegisterOwnerPage() {
    const { registerOwner, registrationData } = useAuth();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            centerName: '',
            registrationNumber: '',
            ownerName: registrationData?.name || '',
            address: '',
            phone: registrationData?.phone || '',
        },
        validate: {
            centerName: (value) => (value.length < 2 ? '센터명을 입력해주세요' : null),
            registrationNumber: (value) =>
                /^\d{3}-\d{2}-\d{5}$/.test(value) ? null : '올바른 사업자 번호 형식이 아닙니다 (000-00-00000)',
            ownerName: (value) => (value.length < 2 ? '대표자 성함을 입력해주세요' : null),
        },
    });

    const handleRegistrationNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value.replace(/[^\d]/g, '');
        if (value.length > 10) value = value.slice(0, 10);

        // Auto format 000-00-00000
        if (value.length >= 3 && value.length < 5) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        } else if (value.length >= 5) {
            value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
        }

        form.setFieldValue('registrationNumber', value);
    };

    const handleSubmit = async (values: typeof form.values) => {
        if (!registrationData?.email) {
            alert('회원 정보가 유실되었습니다. 다시 진행해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 1. Sign Up User (Owner)
            // Note: registerOwner in AuthContext currently redirects. 
            // We need to either modify AuthContext or assume the user stays on this page if we can intercept/prevent redirect,
            // or just let AuthContext handle the user and then we do center creation?
            // Problem: If AuthContext redirects to '/', we can't create the center here.
            // FIX: We will modify AuthContext to accept a 'redirect' flag, OR we accept that for now we might need to duplicate the signup logic here or update AuthContext.
            // Let's assume we updated AuthContext to return the result and NOT redirect if we pass a flag, OR we use a try-catch block and manage flow.
            // Actually, best approach is to update AuthContext first. But since I am editing this file, I'll write the logic as if I can control the redirect.
            // I will update AuthContext next.

            await registerOwner({
                name: values.ownerName,
                email: registrationData.email,
                phone: values.phone,
            }, false); // Pass false to prevent auto-redirect

            // 2. Create Center
            await authApi.registerOrganization({
                name: values.centerName,
                representativeName: values.ownerName,
                businessNumber: values.registrationNumber,
                category: 'Pilates', // Default or add filed
                address: values.address,
                phone: values.phone // Center phone?
            });

            // 3. Redirect manually
            window.location.href = '/';

        } catch (error) {
            console.error(error);
            alert('가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size="lg" h="100vh" py="xl" style={{ display: 'flex', alignItems: 'center' }}>
            <Grid w="100%" gutter="xl" align="center">
                {/* Left Side: Guide */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Stack>
                        <Title order={1}>
                            스튜디오의 정보를<br />
                            입력해 주세요
                        </Title>
                        <Text size="lg" c="dimmed">
                            정확한 데이터 관리를 위해<br />
                            사업자 정보와 위치를 등록합니다.
                        </Text>
                    </Stack>
                </Grid.Col>

                {/* Right Side: Form */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper p="xl" radius="md" withBorder shadow="sm" pos="relative">
                        <LoadingOverlay visible={loading} overlayProps={{ radius: "sm", blur: 2 }} />
                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    label="센터명"
                                    placeholder="예: 스튜디오웨이트 강남점"
                                    required
                                    {...form.getInputProps('centerName')}
                                />

                                <TextInput
                                    label="사업자 번호"
                                    placeholder="000-00-00000"
                                    required
                                    maxLength={12}
                                    {...form.getInputProps('registrationNumber')}
                                    onChange={handleRegistrationNumberChange}
                                />

                                <TextInput
                                    label="대표자 성함"
                                    placeholder="홍길동"
                                    required
                                    {...form.getInputProps('ownerName')}
                                />

                                <TextInput
                                    label="주소"
                                    placeholder="도로명 주소 입력"
                                    description="상세 주소는 나중에 입력할 수 있습니다."
                                    {...form.getInputProps('address')}
                                />

                                <TextInput
                                    label="연락처"
                                    placeholder="02-1234-5678"
                                    {...form.getInputProps('phone')}
                                />

                                <Button
                                    type="submit"
                                    size="md"
                                    mt="md"
                                    loading={loading}
                                >
                                    완료 및 대시보드로 이동
                                </Button>
                            </Stack>
                        </form>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
