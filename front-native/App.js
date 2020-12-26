import React from 'react';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';

import * as Google from 'expo-google-app-auth';

import { useState } from 'react';

export default function App() {
  const [token, setToken] = useState("tokentoken");

  async function signInWithGoogleAsync() {
    try {
      const result = await Google.logInAsync({
        androidClientId: '...',
        //iosClientId: YOUR_CLIENT_ID_HERE,
        scopes: ['profile', 'email'],
      });
  
      if (result.type === 'success') {
        setToken(result.accessToken);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }

  return (
    <View style={styles.container}>
      <Text>To share a photo from your phone with a friend, just press the button below!</Text>
      <Text>{token}</Text>
      <TouchableOpacity
        onPress={() => {signInWithGoogleAsync()}}
        style={{ backgroundColor: 'blue' }}>
        <Text style={{ fontSize: 20, color: '#fff' }}>Pick a photo</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    marginTop: getStatusBarHeight(),
  },
});

