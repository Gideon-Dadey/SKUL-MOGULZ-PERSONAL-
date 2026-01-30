import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "", color = "#A5D6B7" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g stroke={color} strokeWidth="6" opacity="0.9">
                {/* Top Circle */}
                <circle cx="50" cy="38" r="28" />
                {/* Bottom Circle */}
                <circle cx="50" cy="62" r="28" />
                {/* Left Circle */}
                <circle cx="38" cy="50" r="28" />
                {/* Right Circle */}
                <circle cx="62" cy="50" r="28" />
            </g>
            {/* Central highlight */}
            <circle cx="50" cy="50" r="4" fill={color} />
        </svg>
    );
};

export default Logo;


