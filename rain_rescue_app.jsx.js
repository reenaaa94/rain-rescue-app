import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationError('Location permission denied');
          setLoading(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        position => {
          const coords = position.coords;
          setLocation({ latitude: coords.latitude, longitude: coords.longitude });
          fetchWeather(coords.latitude, coords.longitude);
          fetchNearbyShelters(coords.latitude, coords.longitude);
          setLoading(false);
        },
        error => {
          setLocationError(error.message);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
      );
    } catch (err) {
      setLocationError(err.message);
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setWeather(response.data);
    } catch (err) {
      console.warn('Failed to fetch weather:', err);
    }
  };

  const fetchNearbyShelters = (lat, lon) => {
    setNearbyPlaces([
      { id: '1', name: 'City Café', latitude: lat + 0.001, longitude: lon + 0.001 },
      { id: '2', name: 'Sunshine Supermarket', latitude: lat - 0.001, longitude: lon - 0.001 },
      { id: '3', name: 'Hotel Comfort', latitude: lat + 0.0015, longitude: lon - 0.0012 },
    ]);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : location ? (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}>
            <Marker coordinate={location} title="You are here" pinColor="red" />
            {nearbyPlaces.map(place => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                pinColor="blue"
              />
            ))}
          </MapView>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Weather: {weather ? `${weather.weather[0].description}, ${weather.main.temp}°C` : 'Unavailable'}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>
          {locationError || 'Location not available. Please check GPS permissions.'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  map: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffcc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'crimson',
    padding: 20,
  },
});
