// C:\Project\AwesomeProject\src\screens\components\CustomTabBar.js
import React from 'react';
import { View, Platform } from 'react-native';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import RecordFab from './RecordFab';

export default function CustomTabBar(props) {
  const { navigation } = props;

  return (
    <View>
      <BottomTabBar {...props} />
      <RecordFab
        label="Record"
        showCaption={false}                           // ← hide text under FAB
        bottomOffset={Platform.OS === 'ios' ? 46 : 42} // ← lift above tab labels
        onPress={() => navigation.push('Add', { mode: 'spend' })}
      />
    </View>
  );
}
