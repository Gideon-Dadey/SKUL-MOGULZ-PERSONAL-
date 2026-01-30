import React from 'react';
import logoImg from '../assets/logo.png';
export const DEFAULT_AVATAR = logoImg;

interface LogoProps {
    size?: number;
    className?: string;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "" }) => {
    return (
        <img
            src={logoImg}
            alt="Logo"
            width={size}
            height={size}
            className={`${className} rounded-full`}
        />
    );
};

export default Logo;


