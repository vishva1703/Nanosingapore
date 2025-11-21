import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getProgressForScreen } from '@/utils/progressUtils';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ms', label: 'Bahasa Melayu', flag: 'https://flagcdn.com/w40/my.png' },
  { code: 'th', label: 'ภาษาไทย', flag: 'https://flagcdn.com/w40/th.png' },
] as const;

const GENDERS = ['Male', 'Female', 'Other'] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<(typeof LANGUAGES)[number]>(
    LANGUAGES[0],
  );
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const progress = useMemo(() => getProgressForScreen('onboarding'), []);
  const { from } = useLocalSearchParams();
  const isFromSettings = from === "settings";
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Fixed Header at Top */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            {!isFromSettings ? (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              ) : (
                <Text style={{ fontSize: 20, fontWeight: "600", marginLeft: 12 }}>
                  Set Gender
                </Text>
              )}

            {!isFromSettings && (
              <TouchableOpacity
              style={styles.languagePicker}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View style={styles.languageRow}>
                <Image source={{ uri: selectedLanguage.flag }} style={styles.flagIcon} />
                <Ionicons name="chevron-down" size={16} color="#4B5563" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content starts below the header */}
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {!isFromSettings && (
            <View style={styles.section}>
            <Text style={styles.sectionLabel}>Choose your Gender</Text>
            <Text style={styles.helperText}>
              This will be used to calibrate your custom plan.
            </Text>
          </View>
          )}

          <View style={styles.optionList}>
            {GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  selectedGender === gender && styles.selectedOption,
                ]}
                onPress={() => setSelectedGender(gender)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGender === gender && styles.selectedOptionText,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Fixed Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.primaryCta,
              !(selectedGender && selectedLanguage) && { opacity: 0.6 },
            ]}
            disabled={!selectedGender}
            onPress={() => router.push('/screens/workout-frequency')}
          >
            <Text style={styles.primaryCtaText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((lang, index) => (
              <View key={lang.code}>
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setLanguageModalVisible(false);
                  }}
                >
                  <View style={styles.modalItemRow}>
                    <Image source={{ uri: lang.flag }} style={styles.flagIcon} />
                    <Text style={styles.modalItemText}>{lang.label}</Text>
                  </View>
                  {selectedLanguage.code === lang.code && (
                    <Ionicons name="checkmark" size={18} color="#4B3AAC" />
                  )}
                </TouchableOpacity>
                {index !== LANGUAGES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </Modal>
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

  /** HEADER **/
  headerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
  progressFill: {
    height: '100%',
    backgroundColor: '#4B3AAC',
  },
  languagePicker: {
    width: 80,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: 24,
    height: 18,
    borderRadius: 4,
  },

  /** MAIN CONTENT **/
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 120,
    gap: 28,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  helperText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 22,
  },
  optionList: {
    gap: 14,
  },
  optionButton: {
    paddingVertical: 16,
    borderRadius: 14,
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
  optionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1F2937',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /** BOTTOM BUTTON **/
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
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
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /** MODAL **/
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
});
