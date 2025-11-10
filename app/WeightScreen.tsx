import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 220;
const MIN_FEET = 3;
const MAX_FEET = 10;
const MIN_INCH = 0;
const MAX_INCH = 11;
const MIN_WEIGHT_KG = 40;
const MAX_WEIGHT_KG = 160;
const MIN_WEIGHT_LB = 90;
const MAX_WEIGHT_LB = 350;

const CM_PER_INCH = 2.54;
const KG_TO_LB = 2.20462;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MIN_TOTAL_INCHES = MIN_FEET * 12 + MIN_INCH;
const MAX_TOTAL_INCHES = MAX_FEET * 12 + MAX_INCH;

const cmToImperial = (cm: number) => {
  const clampedCm = clamp(cm, MIN_HEIGHT_CM, MAX_HEIGHT_CM);
  let totalInches = Math.round(clampedCm / CM_PER_INCH);
  totalInches = clamp(totalInches, MIN_TOTAL_INCHES, MAX_TOTAL_INCHES);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches - feet * 12;
  return { feet, inches };
};

const imperialToCm = (feet: number, inches: number) => {
  const totalInches = clamp(feet * 12 + inches, MIN_TOTAL_INCHES, MAX_TOTAL_INCHES);
  const cm = Math.round(totalInches * CM_PER_INCH);
  return clamp(cm, MIN_HEIGHT_CM, MAX_HEIGHT_CM);
};

const kgToLb = (kg: number) =>
  clamp(Math.round(kg * KG_TO_LB), MIN_WEIGHT_LB, MAX_WEIGHT_LB);
const lbToKg = (lb: number) =>
  clamp(Math.round(lb / KG_TO_LB), MIN_WEIGHT_KG, MAX_WEIGHT_KG);

const normalizeFeetInches = (feet: number, inches: number) => {
  const totalInches = clamp(feet * 12 + inches, MIN_TOTAL_INCHES, MAX_TOTAL_INCHES);
  const normalizedFeet = Math.floor(totalInches / 12);
  const normalizedInches = totalInches - normalizedFeet * 12;
  return { feet: normalizedFeet, inches: normalizedInches };
};

export default function HeightWeightScreen() {
  const router = useRouter();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('imperial');
  const [height, setHeight] = useState(imperialToCm(5, 7));
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [weight, setWeight] = useState(150);
  const prevUnitRef = useRef(unit);
  const progress = useMemo(() => 0.25, []);

  const heightOptionsMetric = useMemo(
    () => Array.from({ length: MAX_HEIGHT_CM - MIN_HEIGHT_CM + 1 }, (_, i) => MIN_HEIGHT_CM + i),
    []
  );
  const feetOptions = useMemo(
    () => Array.from({ length: MAX_FEET - MIN_FEET + 1 }, (_, i) => MIN_FEET + i),
    []
  );
  const inchOptions = useMemo(
    () => Array.from({ length: MAX_INCH - MIN_INCH + 1 }, (_, i) => MIN_INCH + i),
    []
  );
  const weightOptions = useMemo(
    () =>
      unit === 'metric'
        ? Array.from({ length: MAX_WEIGHT_KG - MIN_WEIGHT_KG + 1 }, (_, i) => MIN_WEIGHT_KG + i)
        : Array.from({ length: MAX_WEIGHT_LB - MIN_WEIGHT_LB + 1 }, (_, i) => MIN_WEIGHT_LB + i),
    [unit]
  );

  const handleMetricHeightSelect = useCallback((cm: number) => {
    const clampedCm = clamp(cm, MIN_HEIGHT_CM, MAX_HEIGHT_CM);
    setHeight(clampedCm);
    const { feet, inches } = cmToImperial(clampedCm);
    setHeightFt(feet);
    setHeightIn(inches);
  }, []);

  const handleFeetSelect = useCallback(
    (feetValue: number) => {
      const { feet, inches } = normalizeFeetInches(feetValue, heightIn);
      setHeightFt(feet);
      setHeightIn(inches);
      setHeight(imperialToCm(feet, inches));
    },
    [heightIn]
  );

  const handleInchesSelect = useCallback(
    (inchValue: number) => {
      const { feet, inches } = normalizeFeetInches(heightFt, inchValue);
      setHeightFt(feet);
      setHeightIn(inches);
      setHeight(imperialToCm(feet, inches));
    },
    [heightFt]
  );

  const handleMetricWeightSelect = useCallback(
    (kgValue: number) => setWeight(clamp(kgValue, MIN_WEIGHT_KG, MAX_WEIGHT_KG)),
    []
  );

  const handleImperialWeightSelect = useCallback(
    (lbValue: number) => setWeight(clamp(lbValue, MIN_WEIGHT_LB, MAX_WEIGHT_LB)),
    []
  );

  useEffect(() => {
    if (prevUnitRef.current === unit) return;

    if (unit === 'imperial') {
      const { feet, inches } = cmToImperial(height);
      setHeightFt(feet);
      setHeightIn(inches);
      setWeight(kgToLb(weight));
    } else {
      setHeight(imperialToCm(heightFt, heightIn));
      setWeight(lbToKg(weight));
    }
    prevUnitRef.current = unit;
  }, [unit, height, heightFt, heightIn, weight]);

  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === 'imperial' ? 'metric' : 'imperial'));
  }, []);

  /** ✅ FIXED Vertical Picker **/
/** ✅ Updated VerticalPicker matching BirthDateScreen style **/
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
        {/* Highlight Box */}
        <View
          style={{
            position: 'absolute',
            top: (ITEM_HEIGHT * VISIBLE_ITEMS) / 2 - ITEM_HEIGHT / 2,
            width: '100%',
            height: ITEM_HEIGHT,
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 10,
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.sectionLabel}>What’s your height and weight?</Text>
          <Text style={styles.helperText}>
            This will be used to calculate your custom plan.
          </Text>
        </View>

        {/* Unit Toggle */}
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, unit === 'imperial' ? styles.switchActive : undefined]}>
            Imperial
          </Text>
          <Switch
            value={unit === 'metric'}
            onValueChange={toggleUnit}
            trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
            thumbColor={unit === 'metric' ? '#4B3AAC' : '#FFFFFF'}
          />
          <Text style={[styles.switchLabel, unit === 'metric' ? styles.switchActive : undefined]}>
            Metric
          </Text>
        </View>

        {/* Height + Weight */}
        <View style={styles.horizontalRow}>
          {unit === 'metric' ? (
            <VerticalPicker
              label="Height"
              value={height}
              options={heightOptionsMetric}
              onSelect={handleMetricHeightSelect}
              displayFn={(item) => `${item} cm`}
            />
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>Height</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <VerticalPicker
                  label=""
                  value={heightFt}
                  options={feetOptions}
                  onSelect={handleFeetSelect}
                  displayFn={(item) => `${item} ft`}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <VerticalPicker
                  label=""
                  value={heightIn}
                  options={inchOptions}
                  onSelect={handleInchesSelect}
                  displayFn={(item) => `${item} in`}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          )}

          <View style={{ width: 16 }} />
          <VerticalPicker
            label="Weight"
            value={weight}
            options={weightOptions}
            onSelect={unit === 'metric' ? handleMetricWeightSelect : handleImperialWeightSelect}
            displayFn={(item) => (unit === 'metric' ? `${item} kg` : `${item} lb`)}
          />
        </View>

        // Inside your HeightWeightScreen component, replace the bottom button section:

<View style={styles.bottomContainer}>
  <TouchableOpacity
    style={[styles.primaryCta, { opacity: 1 }]}
    onPress={() => {
      const heightInMeters = height / 100; // cm → m
      const idealWeight = Math.round(22 * heightInMeters * heightInMeters); // BMI = 22 formula

      // Pass the ideal weight to next screen
      router.push({
        pathname: "/birth-date",
        params: { idealWeight: idealWeight.toString() },
      });
    }}
  >
    <Text style={styles.primaryCtaText}>Next</Text>
  </TouchableOpacity>
</View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  wrapper: { flex: 1 },

  headerContainer: { paddingHorizontal: 24, paddingVertical: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4B3AAC' },

  titleContainer: { paddingHorizontal: 24, marginBottom: 16 },
  sectionLabel: { fontSize: 26, fontWeight: '700', color: '#111827' },
  helperText: { fontSize: 15, color: '#6B7280', lineHeight: 22, marginTop: 4 },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 45,
    marginHorizontal: 24,
    paddingVertical: 10,
  },
  switchLabel: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  switchActive: { color: '#111827' },

  horizontalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginTop: 24,
  },

  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },

  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    flexWrap: 'nowrap',
    includeFontPadding: false,
    letterSpacing: 0.2,
    width: '100%', // ✅ ensures months like “September” fit nicely
  },
  selectedItemText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14, // optional: make selected a bit larger
  },      
  
  unselectedItemText: {
    color: '#9CA3AF', // Grey for others
    fontWeight: '400',
  },
  

  bottomContainer: { position: 'absolute', bottom: 24, left: 24, right: 24 },
  primaryCta: {
    backgroundColor: '#4B3AAC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4B3AAC',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryCtaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});
