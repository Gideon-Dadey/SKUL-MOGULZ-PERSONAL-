import React from 'react';
import logoPng from '../assets/logo.png';

interface LogoProps {
    size?: number;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "" }) => {
    return (
        <img
            src={logoPng}
            width={size}
            height={size}
            alt="SKUL MOGULZ"
            className={className}
            style={{ borderRadius: '20%' }}
        />
    );
};

export default Logo;

