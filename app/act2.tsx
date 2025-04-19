import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type DeviceInfo = {
  brand: string | null;
  modelName: string | null;
  osName: string | null;
  osVersion: string | null;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setDeviceInfo({
      brand: Device.brand ?? 'Unknown',
      modelName: Device.modelName ?? 'Unknown',
      osName: Device.osName ?? 'Unknown',
      osVersion: Device.osVersion ?? 'Unknown',
    });

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <LinearGradient
      colors={['#1F1C2C', '#928DAB']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <LottieView
          autoPlay
          loop
          source={require('@/assets/animation.json')}
          style={styles.animation}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <MaterialIcons name="smartphone" size={24} color="#FFD700" /> Device Info
          </Text>
          {deviceInfo ? (
            <>
              <Text style={styles.cardText}>Brand: {deviceInfo.brand}</Text>
              <Text style={styles.cardText}>Model: {deviceInfo.modelName}</Text>
              <Text style={styles.cardText}>
                OS: {deviceInfo.osName} {deviceInfo.osVersion}
              </Text>
            </>
          ) : (
            <ActivityIndicator size="large" color="#FFD700" />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <MaterialIcons name="location-on" size={24} color="#00FA9A" /> Location
          </Text>
          {location ? (
            <>
              <Text style={styles.cardText}>Latitude: {location.latitude.toFixed(4)}</Text>
              <Text style={styles.cardText}>Longitude: {location.longitude.toFixed(4)}</Text>
            </>
          ) : errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <ActivityIndicator size="large" color="#00FA9A" />
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={() => { triggerHaptic(); }}>
          <Text style={styles.buttonText}>Tap me!</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#EEE',
    marginBottom: 4,
  },
  errorText: {
    color: '#FF4500',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F1C2C',
  },
});
