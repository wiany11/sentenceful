# SentenceFul

## back

```
```

## front-native

```
mv -f front-native front-native.0
expo init front-native
mv -f front-native.0/App.js front-native/
mv -f front-native.0/src/ front-native/

cd front-native
expo install expo-google-app-auth
expo install expo-google-sign-in
npm install --save react-native-status-bar-height

expo start
```
