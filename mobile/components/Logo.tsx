import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface LogoProps {
    size?: number;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, color = "#A5D6B7" }) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
        >
            <Path
                d="M50 20C38.9543 20 30 28.9543 30 40C30 45.5228 32.2386 50.5228 35.8579 54.1421C39.4772 57.7614 44.4772 60 50 60C61.0457 60 70 51.0457 70 40C70 28.9543 61.0457 20 50 20Z"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <Path
                d="M35 55C23.9543 55 15 63.9543 15 75C15 86.0457 23.9543 95 35 95C46.0457 95 55 86.0457 55 75C55 63.9543 46.0457 55 35 55Z"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <Path
                d="M65 55C76.0457 55 85 63.9543 85 75C85 86.0457 76.0457 95 65 95C53.9543 95 45 86.0457 45 75C45 63.9543 53.9543 55 65 55Z"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
            />
            <Path
                d="M50 50C38.9543 50 30 58.9543 30 70C30 81.0457 38.9543 90 50 90C61.0457 90 70 81.0457 70 70C70 58.9543 61.0457 50 50 50Z"
                stroke={color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.6"
            />
            <Circle cx="50" cy="55" r="4" fill={color} />
        </Svg>
    );
};

export default Logo;
