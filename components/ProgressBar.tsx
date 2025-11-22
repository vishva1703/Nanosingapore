// components/ProgressBar.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { getProgressForScreen, ScreenStep } from '@/utils/progressUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { wp, hp, RFValue } from '@/utils/responsive';

type Props = {
  screen: ScreenStep;     // dynamic screen name
  showBack?: boolean;     // optional back button
  noContainer?: boolean;  // if true, don't render the outer container
};

export default function ProgressBar({ screen, showBack = true, noContainer = false }: Props) {
  const router = useRouter();
  const progress = useMemo(() => getProgressForScreen(screen), [screen]);

  const progressBar = (
    <>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButtonWrapper}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={RFValue(24)}
            color="#1F2937"
          />
        </TouchableOpacity>
      )}

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </>
  );

  if (noContainer) {
    return <>{progressBar}</>;
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        {progressBar}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  backButtonWrapper: {
    width: wp('10%'),
    height: hp('5%'),
    borderRadius: wp('5.5%'),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    flex: 1,
    height: hp('1%'),
    borderRadius: wp('1%'),
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4B3AAC',
  },
});
