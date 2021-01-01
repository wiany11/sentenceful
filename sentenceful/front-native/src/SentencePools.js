import React, {
  // useEffect,
  // useState
} from 'react';

import {
  Button,
  FlatList,
  SafeAreaView
} from 'react-native';

export default function SentencePools(props) {
  return (
    <SafeAreaView 
      style={{
        backgroundColor: 'green',
      }}
    >
      <FlatList
        data={props.pools}
        renderItem={({item}) =>
          <Button
            onPress={() => {props.setPool(item.name)}}
            title={item.name}
          />
        }
        keyExtractor={pool => '' + pool.key}
      />
    </SafeAreaView>
  );
}
