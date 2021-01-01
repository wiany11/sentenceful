import React, {
  useEffect,
  useState
} from 'react';

import {
  Button,
  SafeAreaView,
  Text,
} from 'react-native';

import SentencePools from './SentencePools';

export default function Sentenceful(props) {
  const [pool, setPool] = useState('');
  const [pools, setPools] = useState([]);

  let fetchPools = () => {
    fetch(props.backEnd + '/pools', {
      method: 'POST',
      body: JSON.stringify({
        signed_in: props.signedIn,
      })
    }).then((response) => response.json()).then((response) => {
      setPools(response.pools);
    }).catch((error) => {});
  }

  useEffect(() => {
    fetchPools();
  }, []);

  if (pool === '') {
    return (
      <SentencePools
        setPool={setPool}
        pools={pools}
      />
    );
  } else {
    return (
      <SafeAreaView 
        style={{
          backgroundColor: 'red',
        }}
      >
        <Text style={{fontSize: 15, color: '#fff'}}>{pool}</Text>
        <Button
          onPress={() => {setPool('')}}
          title={'Go back'}
        />
      </SafeAreaView>
    );
  }
}
