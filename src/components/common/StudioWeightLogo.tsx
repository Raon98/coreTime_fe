import React from 'react';

export const StudioWeightLogo = ({ size = 40 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* 외부 원 - 코어와 균형을 상징 */}
        <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#4F46E5"
            strokeWidth="12"
            strokeLinecap="round"
        />
        {/* 내부 수직 바 - 무게감과 중심 잡기를 상징 */}
        <path
            d="M50 30V70"
            stroke="#4F46E5"
            strokeWidth="12"
            strokeLinecap="round"
        />
        {/* 하단 포인트 - 안정적인 지지점 */}
        <circle cx="50" cy="78" r="6" fill="#10B981" />
    </svg>
);
