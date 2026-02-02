import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated as RNAnimated } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence,
  withSpring,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const CustomSplashScreen = ({ onFinish }: { onFinish?: () => void }) => {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const bgOpacity = useSharedValue(0);

  useEffect(() => {
    // Initial entrance
    bgOpacity.value = withTiming(1, { duration: 800 });
    
    logoScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 90 }));
    logoOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(1000, withSpring(0, { damping: 15 }));

    // Finish callback after transition
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Gradient & Pattern */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <Svg height="100%" width="100%">
          <Defs>
            <RadialGradient
              id="grad"
              cx="50%"
              cy="50%"
              rx="50%"
              ry="50%"
              fx="50%"
              fy="50%"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0%" stopColor="#0a2a22" stopOpacity="1" />
              <Stop offset="100%" stopColor="#050505" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
          
          {/* Subtle Dot Pattern */}
          {[...Array(20)].map((_, i) => 
            [...Array(30)].map((_, j) => (
              <Circle 
                key={`${i}-${j}`}
                cx={(width / 20) * i + (width / 40)} 
                cy={(height / 30) * j + (height / 60)} 
                r="0.5" 
                fill="rgba(165, 214, 183, 0.1)" 
              />
            ))
          )}
        </Svg>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Svg width="160" height="160" viewBox="0 0 100 100">
            {/* Recreating the Skul Mogulz logo with SVG */}
            {/* Top Circle */}
            <Circle 
              cx="50" cy="35" r="22" 
              stroke="#A5D6B7" strokeWidth="2.5" fill="none" 
            />
            {/* Bottom Circle */}
            <Circle 
              cx="50" cy="65" r="22" 
              stroke="#A5D6B7" strokeWidth="2.5" fill="none" 
            />
            {/* Left Circle */}
            <Circle 
              cx="35" cy="50" r="22" 
              stroke="#A5D6B7" strokeWidth="2.5" fill="none" 
            />
            {/* Right Circle */}
            <Circle 
              cx="65" cy="50" r="22" 
              stroke="#A5D6B7" strokeWidth="2.5" fill="none" 
            />
            
            {/* Center overlap highlighting */}
            <Circle 
              cx="50" cy="50" r="8" 
              stroke="#A5D6B7" strokeWidth="1" fill="rgba(165, 214, 183, 0.1)" 
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>SKUL MOGULZ</Text>
          <Text style={styles.subtitle}>SOCIAL ECOSYSTEM</Text>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Innovation</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A5D6B7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(165, 214, 183, 0.1)',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A5D6B7',
    letterSpacing: 4,
    marginTop: 8,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '400',
  }
});

export default CustomSplashScreen;
