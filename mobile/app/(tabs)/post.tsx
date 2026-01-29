import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function PostTabPlaceholder() {
    const router = useRouter();

    useEffect(() => {
        // This screen shouldn't really be visible because of the interceptor in _layout.tsx
        // but we'll redirect to modal just in case.
        router.replace('/modal');
    }, []);

    return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
