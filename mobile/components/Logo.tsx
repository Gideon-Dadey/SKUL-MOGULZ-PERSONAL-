import React from 'react';
import Svg, { Circle, G } from 'react-native-svg';

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
            <G stroke={color} strokeWidth="6" opacity="0.9">
                {/* Top Circle */}
                <Circle cx="50" cy="38" r="28" />
                {/* Bottom Circle */}
                <Circle cx="50" cy="62" r="28" />
                {/* Left Circle */}
                <Circle cx="38" cy="50" r="28" />
                {/* Right Circle */}
                <Circle cx="62" cy="50" r="28" />
            </G>
            {/* Central highlight */}
            <Circle cx="50" cy="50" r="4" fill={color} />
        </Svg>
    );
};

export default Logo;


