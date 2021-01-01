import React, {
  useState
} from 'react';

import {
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import {getStatusBarHeight} from 'react-native-status-bar-height';

import * as Google from 'expo-google-app-auth';

import Sentenceful from './src/Sentenceful';

export default function App() {
  const backEnd = 'http://sentenceful.cafe24.com:44400';
  const [signedIn, setSignedIn] = useState(null);

  let signIn = {
    withGoogle: async () => {
      try {
        const logInResult = await Google.logInAsync({
          androidClientId: '759868072746-81dos3od0712gkjlntbghet4l026gvgv.apps.googleusercontent.com',
          // iosClientId: YOUR_CLIENT_ID_HERE,
          scopes: ['email'],  // ['profile', 'email']
        });

        if (logInResult.type !== 'success')
          return;

        fetch(backEnd + '/users', {
          method: 'POST',
          body: JSON.stringify({
            signed_in: {
              google: logInResult
            },
          })
        }).then((response) => response.json()).then((response) => {
          if ('email' in response) {
            setSignedIn({
              google: logInResult,
            });
          }
        }).catch((error) => {});
      } catch (e) {
      }
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: getStatusBarHeight(),
      }}
    >
      {signedIn === null ? (
        <TouchableOpacity
          onPress={() => {signIn.withGoogle()}}
          style={{
            backgroundColor: 'blue',
          }}
        >
          <Text style={{fontSize: 20, color: '#fff'}}>Sign in with Google</Text>
        </TouchableOpacity>
      ) : (
        <Sentenceful
          backEnd={backEnd}
          signedIn={signedIn}
        />
      )}
    </View>
  );
}
