import React from 'react';
import { Image } from 'react-native';

interface LogoProps {
    size?: number;
    color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
    return (
        <Image
            source={require('../assets/images/icon.png')}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="contain"
        />
    );
};

export default Logo;


