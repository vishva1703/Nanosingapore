import { hp, RFValue, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ITEM_HEIGHT = hp('6.25%'); // Responsive item height
const VISIBLE_ITEMS = 5;

const MIN_WEIGHT_KG = 40;
const MAX_WEIGHT_KG = 160;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function HeightWeightScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Initialize with current weight from params or default to 70
  const initialWeight = params.currentWeight 
    ? parseFloat(params.currentWeight as string) 
    : 70;
  const [weight, setWeight] = useState(
    !isNaN(initialWeight) && initialWeight >= MIN_WEIGHT_KG && initialWeight <= MAX_WEIGHT_KG
      ? initialWeight
      : 70
  );

  const weightOptions = useMemo(
    () => Array.from({ length: MAX_WEIGHT_KG - MIN_WEIGHT_KG + 1 }, (_, i) => MIN_WEIGHT_KG + i),
    []
  );

  const handleWeightSelect = useCallback(
    (kgValue: number) => setWeight(clamp(kgValue, MIN_WEIGHT_KG, MAX_WEIGHT_KG)),
    []
  );

  const VerticalPicker = React.memo(function VerticalPicker({
    label,
    value,
    options,
    onSelect,
    displayFn,
    style,
  }: {
    label: string;
    value: number;
    options: number[];
    onSelect: (val: number) => void;
    displayFn: (item: number) => string;
    style?: any;
  }) {
    const scrollY = useRef(new Animated.Value(0)).current;
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
      if (!listRef.current || options.length === 0) return;

      let index = options.indexOf(value);
      if (index === -1) index = 0;

      listRef.current.scrollToOffset({
        offset: index * ITEM_HEIGHT,
        animated: false,
      });
    }, [options, value]);

    const onScrollEnd = (e: any) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const safeIndex = clamp(index, 0, options.length - 1);
      const selected = options[safeIndex];
      if (typeof selected === 'number' && selected !== value) {
        onSelect(selected);
      }
    };

    return (
      <View style={[{ flex: 1, alignItems: 'center', width: '100%' }, style]}>
        {label ? <Text style={styles.selectorLabel}>{label}</Text> : null}

        <View
          style={{
            position: 'relative',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            height: ITEM_HEIGHT * VISIBLE_ITEMS,
          }}
        >

          <View
            style={{
              position: 'absolute',
              top: (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - ITEM_HEIGHT / 2,
              width: '100%',
              height: ITEM_HEIGHT,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: wp('2.5%'),
              zIndex: 2,
            }}
          />

          <Animated.FlatList
            ref={listRef}
            data={options}
            keyExtractor={(item) => item.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{
              paddingVertical: (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2,
            }}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            onMomentumScrollEnd={onScrollEnd}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
              ];

              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0.2, 0.5, 1, 0.5, 0.2],
                extrapolate: 'clamp',
              });

              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [0.9, 0.95, 1.1, 0.95, 0.9],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={[styles.itemContainer, { opacity, transform: [{ scale }] }]}
                >
                  <Text
                    style={[
                      styles.itemText,
                      item === value && styles.selectedItemText,
                    ]}
                  >
                    {displayFn(item)}
                  </Text>
                </Animated.View>
              );
            }}
          />
        </View>
      </View>
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={RFValue(24)} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.sectionLabel}>What is your current weight?</Text>
        </View>

     

        <View style={styles.pickerContainer}>
          <VerticalPicker
            label="Weight"
            value={weight}
            options={weightOptions}
            onSelect={handleWeightSelect}
            displayFn={(item) => `${item} kg`}
          />
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.primaryCta, { opacity: 1 }]}
            onPress={() => {
              router.push({
                pathname: "/me",
                params: { weight: weight.toString() },
              });
            }}
          >
            <Text style={styles.primaryCtaText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  wrapper: { flex: 1 },

  headerContainer: { paddingHorizontal: wp('6%'), paddingVertical: hp('2%') },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: wp('2%') },
  backButton: {
    width: wp('10%'),
    height: hp('5%'),
    borderRadius: wp('5.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  titleContainer: { paddingHorizontal: wp('6%'), marginBottom: hp('2%') },
  sectionLabel: { fontSize: RFValue(26), fontWeight: '700', color: '#111827' },

  unitIndicator: {
    alignItems: 'center',
    marginTop: hp('2.5%'),
  },
  unitText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#4B3AAC',
  },

  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp('6%'),
    marginTop: hp('5%'),
  },

  selectorLabel: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp('1.25%'),
    textAlign: 'center',
  },

  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: RFValue(18),
    color: '#9CA3AF',
    textAlign: 'center',
    flexWrap: 'nowrap',
    includeFontPadding: false,
    letterSpacing: 0.2,
    width: '100%',
  },
  selectedItemText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: RFValue(14), 
  },      

  bottomContainer: { 
    position: 'absolute', 
    bottom: hp('3%'), 
    left: wp('6%'), 
    right: wp('6%') 
  },
  primaryCta: {
    backgroundColor: '#4B3AAC',
    paddingVertical: hp('2%'),
    borderRadius: wp('3.5%'),
    alignItems: 'center',
    shadowColor: '#4B3AAC',
    shadowOpacity: 0.3,
    shadowRadius: wp('2.5%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
  },
  primaryCtaText: { 
    color: '#FFFFFF', 
    fontSize: RFValue(16), 
    fontWeight: '600', 
    letterSpacing: 0.3 
  },
});