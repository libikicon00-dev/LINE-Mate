import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutChangeEvent, Animated } from 'react-native';

/** Generic Segmented Tabs with strong typing */
type Segment<K extends string> = { key: K; label: string; icon?: React.ReactNode };

type Props<K extends string> = {
  segments: Segment<K>[];
  value: K;                          // current selected key
  onChange: (key: K) => void;        // <— typed callback
  height?: number;
  radius?: number;
  bg?: string;
  activeBg?: string;
  activeColor?: string;
  inactiveColor?: string;
};

export default function SegmentedTabs<K extends string>({
  segments,
  value,
  onChange,
  height = 40,
  radius = 999,
  bg = '#E8FDEB',
  activeBg = '#fff',
  activeColor = '#00C853',
  inactiveColor = '#0E7C66',
}: Props<K>) {
  const trackW = useRef(0);
  const thumbX = useRef(new Animated.Value(0)).current;

  const index = Math.max(0, segments.findIndex(s => s.key === value));
  const count = segments.length || 1;

  useEffect(() => {
    if (!trackW.current || count === 0) return;
    const segW = trackW.current / count;
    Animated.spring(thumbX, {
      toValue: index * segW,
      useNativeDriver: true,
      friction: 10,
      tension: 120,
    }).start();
  }, [index, count, thumbX]);

  const onLayout = (e: LayoutChangeEvent) => {
    trackW.current = e.nativeEvent.layout.width;
    const segW = trackW.current / count;
    thumbX.setValue(index * segW);
  };

  const segmentStyles = useMemo(() => ({ height, borderRadius: radius }), [height, radius]);

  return (
    <View style={[styles.track, { backgroundColor: bg }, segmentStyles]} onLayout={onLayout}>
      {/* animated thumb */}
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: activeBg,
            width: `${100 / count}%`,
            height: height - 8,
            borderRadius: radius,
            transform: [{ translateX: thumbX }],
          },
        ]}
      />
      {/* pressable labels */}
      {segments.map(s => {
        const active = s.key === value;
        return (
          <TouchableOpacity
            key={s.key}
            style={styles.item}
            activeOpacity={0.85}
            onPress={() => onChange(s.key)}
          >
            <View style={styles.center}>
              {s.icon}
              <Text style={[styles.label, { color: active ? activeColor : inactiveColor }]}>
                {s.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: 'relative',
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  item: {
    flex: 1,
    height: '100%',
  },
  center: {
    height: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    fontWeight: '800',
    fontSize: 13,
  },
});
