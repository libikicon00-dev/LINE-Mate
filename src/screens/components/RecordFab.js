// C:\Project\AwesomeProject\src\screens\components\RecordFab.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather as Icon } from '@react-native-vector-icons/feather';


const LINE = '#00C853';
const SIZE = 64;

export default function RecordFab({
  onPress,
  label = 'Record',
  showCaption = false,                 // ← NEW: hide caption by default
  bottomOffset,                        // ← NEW: allow custom bottom
}) {
  // default bottom if not provided
  const bottom = bottomOffset ?? (Platform.OS === 'ios' ? 42 : 38);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.button}>
        <Icon name="plus" size={22} color="#fff" />
      </TouchableOpacity>
      {showCaption ? <Text style={styles.caption}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
    zIndex: 999, // keep it above the tab bar
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  caption: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: LINE,
  },
});
