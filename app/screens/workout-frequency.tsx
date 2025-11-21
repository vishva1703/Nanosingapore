import { hp, RFValue, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProgressForScreen } from '@/utils/progressUtils';


type IoniconName = ComponentProps<typeof Ionicons>['name'];

const WORKOUT_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  icon: IoniconName;
}> = [
    { value: '0-2', label: '0-2 ', icon: 'bed-outline' },
    { value: '3-5', label: '3-5 ', icon: 'bicycle-outline' },
    { value: '6+', label: '6+ ', icon: 'flame-outline' },
  ];

export default function WorkoutFrequencyScreen() {
  const router = useRouter();
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null);
  const progress = useMemo(() => getProgressForScreen('workout-frequency'), []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
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

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How many workouts do you do  per week?</Text>
            <Text style={styles.helperText}>
              This will be used to calibrate your custom plan.
            </Text>
          </View>

          <View style={styles.optionList}>
            {WORKOUT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  selectedFrequency === option.value && styles.selectedOption,
                ]}
                onPress={() => setSelectedFrequency(option.value)}
                activeOpacity={0.8}
              >
                <View style={styles.optionContent}>
                  {/* --- Icon Wrapper --- */}
                  <View
                    style={[
                      styles.optionIconWrapper,
                      selectedFrequency === option.value && styles.optionIconWrapperSelected,
                    ]}
                  >
                    {option.value === '0-2' && <View style={styles.singleDot} />}
                    {option.value === '3-5' && (
                      <View style={styles.pyramidWrapper}>
                        <View style={styles.pyramidTop}>
                          <View style={styles.dot} />
                        </View>
                        <View style={styles.pyramidBottom}>
                          <View style={styles.dot} />
                          <View style={styles.dot} />
                        </View>
                      </View>
                    )}
                    {option.value === '6+' && (
                      <View style={styles.sixWrapper}>
                        <View style={styles.sixColumn}>
                          <View style={styles.dot} />
                          <View style={styles.dot} />
                          <View style={styles.dot} />
                        </View>
                        <View style={styles.sixColumn}>
                          <View style={styles.dot} />
                          <View style={styles.dot} />
                          <View style={styles.dot} />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* --- Text Section (Main + Subtext) --- */}
                  <View style={styles.optionTextBlock}>
                    <Text
                      style={[
                        styles.optionText,
                        selectedFrequency === option.value && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {option.value === '0-2' && (
                      <Text
                        style={[
                          styles.subLabel,
                          selectedFrequency === option.value && styles.subLabelSelected,
                        ]}
                      >
                        Workouts now and then
                      </Text>
                    )}

                    {option.value === '3-5' && (
                      <Text
                        style={[
                          styles.subLabel,
                          selectedFrequency === option.value && styles.subLabelSelected,
                        ]}
                      >
                        A few workouts per week
                      </Text>
                    )}

                    {option.value === '6+' && (
                      <Text
                        style={[
                          styles.subLabel,
                          selectedFrequency === option.value && styles.subLabelSelected,
                        ]}
                      >
                        Dedicated Athlete
                      </Text>
                    )}
                  </View>
                </View>

              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.primaryCta, !selectedFrequency && { opacity: 0.6 }]}
            disabled={!selectedFrequency}
            onPress={() => router.push({
              pathname: "/screens/WeightScreen",
              params: { from: "workout-frequency" }
            })}
          >
            <Text style={styles.primaryCtaText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  wrapper: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
  },
  backButton: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    flex: 1,
    height: hp('1%'),
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4B3AAC',
  },

  flagIcon: {
    width: 24,
    height: 18,
    borderRadius: 4,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: 0,
    paddingBottom: hp('15%'),
    gap: hp('3.5%'),
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: RFValue(26),
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    fontSize: RFValue(15),
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 22,
  },
  optionList: {
    gap: hp('2%'),
  },
  optionButton: {
    paddingVertical: hp('2%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  selectedOption: {
    backgroundColor: '#4B3AAC',
    borderColor: '#4B3AAC',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // 👈 align everything to the left
    gap: wp('3%'),
    paddingLeft: wp('3%'), // 👈 gives breathing space from the left edge
  },

  optionIconWrapper: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrapperSelected: {
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    textAlign: 'center',
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    left: wp('6%'),
    right: wp('6%'),
  },
  primaryCta: {
    backgroundColor: '#4B3AAC',
    paddingVertical: hp('2.2%'),
    borderRadius: wp('4%'),
    alignItems: 'center',
    shadowColor: '#4B3AAC',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: RFValue(16),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  singleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4B5563',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4B5563',
  },
  pyramidWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pyramidTop: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pyramidBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    gap: 3,
  },
  sixWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  sixColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 3,
  },
  optionTextBlock: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  subLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  subLabelSelected: {
    color: '#FFFFFF', // white text when selected
  },

});


