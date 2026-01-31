import React from 'react';

interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const ModernChatIcon: React.FC<IconProps> = ({
    size = 24,
    color = 'currentColor',
    className,
    style
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={style}
        >
            {/* Top/Back Bubble */}
            <path d="M7 12H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
            {/* Bottom/Front Bubble */}
            <path d="M10 21l-3-3H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-4l-3 3z" />
        </svg>
    );
};
