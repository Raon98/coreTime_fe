'use client';

import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'indigo',

    // Define a crisper, brighter color palette
    // Mantine default is good, but we can enforce specific shades if needed.
    defaultRadius: 'md',

    fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, Helvetica Neue, Segoe UI, Apple SD Gothic Neo, Malgun Gothic, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, sans-serif',
    headings: {
        fontFamily: 'Pretendard, sans-serif',
        sizes: {
            h1: { fontSize: '24px', fontWeight: '800' }, // Bolder
            h2: { fontSize: '20px', fontWeight: '700' },
        },
    },
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
                fw: 600, // Semi-bold buttons
            },
        },
        Card: {
            defaultProps: {
                radius: 'lg',
                shadow: 'sm',
                withBorder: true, // Always concise border
            }
        },
        Paper: {
            defaultProps: {
                radius: 'lg',
                shadow: 'xs',
                withBorder: true,
            }
        },
        Badge: {
            defaultProps: {
                radius: 'sm',
                fw: 600,
            }
        }
    }
});
