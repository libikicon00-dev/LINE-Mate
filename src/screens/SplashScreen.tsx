import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const LINE_GREEN = '#00C853';
const LINE_LIGHT = '#00E676';

// 🟢 Khai báo type cho Stack
type RootStackParamList = {
  MainTabs: undefined;
};

type SplashProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;
};

export default function SplashScreen({ navigation }: SplashProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => navigation.replace('MainTabs'), 1800);
    return () => clearTimeout(t);
  }, [navigation, opacity, scale]);

  return (
    <LinearGradient
      colors={[LINE_LIGHT, LINE_GREEN]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.wrap}
    >
      <StatusBar barStyle="light-content" backgroundColor={LINE_GREEN} />

      <Animated.View
        style={[
          styles.logoBox,
          {
            transform: [
              {
                scale: scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
            opacity,
          },
        ]}
      >
        <Image
  source={require('../../assets/icon.jpg')}
  style={styles.logoImg}
  resizeMode="contain"
/>

        <Text style={styles.logoText}></Text>
      </Animated.View>

      <Animated.Text style={[styles.sub, { opacity }]}>
        Smart with money, kind with you
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LINE_GREEN,
  },
  logoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // chỉ cách tagline khoảng 20px
  },
  logoImg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  logoText: {
    fontSize: 50,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },
  sub: {
    marginTop: 1, // gần logo hơn
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
