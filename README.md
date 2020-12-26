# sentenceful

## Run

### Front

```
mv -f front-native front-native.0
expo init front-native
mv -f front-native.0/* front-native/
rm -rf front-native.0

cd front-native
expo install expo-google-app-auth
npm install --save react-native-status-bar-height

npm start
```
