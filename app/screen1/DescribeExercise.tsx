import wellnessApi from "@/api/wellnessApi";
import { useActivity } from "@/components/ActivityContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DescribeExercise() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { addActivity, setIsAnalyzing } = useActivity();
  const params = useLocalSearchParams();
  const { activities, updateActivity, deleteActivity } = useActivity();
  
  // Extract params (handle both string and array formats)
  const getParam = (param: string | string[] | undefined): string => {
    return Array.isArray(param) ? param[0] : (param || "");
  };
  
  const activityId = getParam(params.activityId);
  const activityLogId = getParam(params.activityLogId) || activityId;
  const activityType = getParam(params.activityType);
  const activityDescription = getParam(params.activityDescription);
  const activityDuration = parseInt(getParam(params.activityDuration) || "0");
  const activityIntensity = parseInt(getParam(params.activityIntensity) || "1");
  const activityCalories = parseInt(getParam(params.activityCalories) || "0");
  const activityDate = getParam(params.activityDate);
  const activityTime = getParam(params.activityTime);
  
  const isEditMode = Boolean(activityId);
  
  // Find activity from context or construct from params
  const existingActivity = activities.find(a => a.id === activityId || a.logId === activityId) || 
    (isEditMode ? {
      id: activityId,
      logId: activityLogId,
      type: activityType,
      description: activityDescription,
      duration: activityDuration,
      intensity: activityIntensity,
      calories: activityCalories,
      date: activityDate,
      time: activityTime,
    } : null);
  
  // Load existing activity data when in edit mode
  useEffect(() => {
    if (isEditMode) {
      // Pre-fill description from params or context
      if (activityDescription) {
        setDescription(activityDescription);
      } else if (existingActivity?.description) {
        setDescription(existingActivity.description);
      } else {
        // Reconstruct description from activity data
        const typeText = existingActivity?.type || activityType || '';
        const duration = existingActivity?.duration || activityDuration || 0;
        const intensity = existingActivity?.intensity !== undefined ? existingActivity.intensity : activityIntensity;
        const durationText = duration ? `${duration} mins` : '';
        const intensityText = intensity === 2 ? 'high intensity' : 
                             intensity === 1 ? 'medium intensity' : 'low intensity';
        const reconstructedDesc = `${typeText} ${durationText} ${intensityText}`.trim();
        if (reconstructedDesc) {
          setDescription(reconstructedDesc);
        }
      }
    }
  }, [isEditMode]);

  // Function to extract exercise type from description
  const getExerciseType = (desc: string) => {
    if (!desc.trim()) return "Custom Exercise";
    
    const lowerDesc = desc.toLowerCase();
    
    // Common exercise patterns
    if (lowerDesc.includes('yoga') || lowerDesc.includes('stretch')) return "Yoga";
    if (lowerDesc.includes('run') || lowerDesc.includes('jog') || lowerDesc.includes('sprint')) return "Running";
    if (lowerDesc.includes('walk')) return "Walking";
    if (lowerDesc.includes('cycle') || lowerDesc.includes('bike')) return "Cycling";
    if (lowerDesc.includes('swim')) return "Swimming";
    if (lowerDesc.includes('weight') || lowerDesc.includes('lift') || lowerDesc.includes('gym')) return "Weight Lifting";
    if (lowerDesc.includes('cardio')) return "Cardio";
    if (lowerDesc.includes('dance')) return "Dancing";
    if (lowerDesc.includes('hiit')) return "HIIT";
    if (lowerDesc.includes('pilates')) return "Pilates";
    
    // Extract first few words as exercise type
    const words = desc.split(' ').filter(word => word.length > 0);
    if (words.length > 0) {
      return words.slice(0, 2).join(' '); // Take first 2 words as exercise name
    }
    
    return "Custom Exercise";
  };

  // Function to estimate calories based on description
  const estimateCalories = (desc: string, duration: number) => {
    const lowerDesc = desc.toLowerCase();
    let baseCalories = 3; // Default calories per minute
    
    if (lowerDesc.includes('intense') || lowerDesc.includes('high') || lowerDesc.includes('hiit')) {
      baseCalories = 8;
    } else if (lowerDesc.includes('moderate') || lowerDesc.includes('medium')) {
      baseCalories = 5;
    } else if (lowerDesc.includes('light') || lowerDesc.includes('low') || lowerDesc.includes('walk')) {
      baseCalories = 3;
    }
    
    return Math.floor(baseCalories * duration);
  };

  // Function to estimate duration from description
  const estimateDuration = (desc: string) => {
    const timeMatch = desc.match(/(\d+)\s*(min|minutes|mins|hour|hours|hr|hrs)/i);
    if (timeMatch) {
      const number = parseInt(timeMatch[1]);
      if (timeMatch[2].toLowerCase().includes('hour')) {
        return number * 60; // Convert hours to minutes
      }
      return number;
    }
    
    // Default duration if not specified
    return Math.floor(Math.random() * 45) + 15; // 15-60 minutes
  };

  // Function to estimate intensity from description
  const estimateIntensity = (desc: string) => {
    const lowerDesc = desc.toLowerCase();
    
    if (lowerDesc.includes('high') || lowerDesc.includes('intense') || lowerDesc.includes('hiit')) {
      return 2; // High
    } else if (lowerDesc.includes('moderate') || lowerDesc.includes('medium')) {
      return 1; // Medium
    } else {
      return 0; // Low
    }
  };

 
const handleAddExercise = async () => {
    if (!description.trim()) return;
  
    try {
      setLoading(true);
      setIsAnalyzing(true);   // ⬅ show loading skeleton in Home
  
      const duration = estimateDuration(description);
      const intensity = estimateIntensity(description);
      const calories = estimateCalories(description, duration);
      const exerciseType = getExerciseType(description);
      
      // Get current date
      const now = new Date();
      const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      
      console.log("📝 [DescribeExercise] Logging exercise by description to backend:", {
        description,
        date: currentDate
      });
      
      const apiResponse = await wellnessApi.logExerciseByDescribe({
        description,
        date: currentDate
      });
      
      console.log("📝 [DescribeExercise] API Response:", JSON.stringify(apiResponse, null, 2));
      
      // Verify response indicates success
      const isSuccess = (apiResponse?.success === true || apiResponse?.flag === true) ||
                        (apiResponse?.message && (
                          apiResponse.message.toLowerCase().includes('logged') ||
                          apiResponse.message.toLowerCase().includes('saved') ||
                          apiResponse.message.toLowerCase().includes('created')
                        ));
      
      if (!isSuccess) {
        console.warn("⚠️ [DescribeExercise] API response may indicate failure:", apiResponse);
        const errorMsg = apiResponse?.error || apiResponse?.message || "Unknown error";
        throw new Error(errorMsg);
      }
      
      console.log("✅ [DescribeExercise] Exercise successfully logged to database!");
      
      // Extract logId from API response (try multiple possible locations)
      const logId = apiResponse?.data?.logId || 
                    apiResponse?.data?.id || 
                    apiResponse?.logId || 
                    apiResponse?.id ||
                    apiResponse?.result?.logId ||
                    apiResponse?.result?.id;
      
      console.log("📝 [DescribeExercise] Extracted logId:", logId);
  
      const newActivity = {
        id: logId || Date.now().toString(),
        type: exerciseType,
        calories,
        duration,   
        intensity,
        description,
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: currentDate,
        logId: logId, // Store API logId for future updates/deletes
      };
  
      // Add to context for immediate UI update
      addActivity(newActivity);
      setIsAnalyzing(false);   // hide loading
      
      // Optional: Verify by fetching recent logs
      try {
        const verificationLogsResponse = await wellnessApi.getRecentLogs({ page: 1, limit: 1, date: currentDate });
        const verificationLogs = verificationLogsResponse?.data?.list || 
                                 verificationLogsResponse?.data || 
                                 verificationLogsResponse?.result || 
                                 verificationLogsResponse?.logs || [];
        const foundInRecentLogs = verificationLogs.some((log: any) => 
          log.logId === logId || 
          (log.type && log.description === description)
        );
        if (foundInRecentLogs) {
          console.log("✅ [DescribeExercise] ✅ VERIFICATION SUCCESS: Exercise found in recent logs!");
        } else {
          console.warn("⚠️ [DescribeExercise] ❌ VERIFICATION: Exercise not found in recent logs immediately (may appear after refresh)");
        }
      } catch (verificationError) {
        console.error("❌ [DescribeExercise] Error during post-log verification:", verificationError);
      }
      
      const successMessage = logId 
        ? `Exercise "${exerciseType}" logged successfully!` 
        : `Exercise "${exerciseType}" logged successfully!`;
      
      Alert.alert(
        "Success! ✅",
        successMessage,
        [
          {
            text: "OK",
            onPress: async () => {
              // Small delay to ensure backend has processed the request
              await new Promise(resolve => setTimeout(resolve, 500));
              // Navigate to dashboard (index page) - activity will appear in "Recently Logged" section
              // The useFocusEffect in index.tsx will automatically refresh the data
              router.push({
                pathname: '/(tabs)/',
                params: { refresh: Date.now().toString() }
              });
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error("❌ [DescribeExercise] Error logging exercise:", error);
      setIsAnalyzing(false);
      
      // Check for specific error types
      const errorMessage = error?.message || '';
      const errorResponse = error?.response?.data?.message || '';
      const statusCode = error?.response?.status || error?.status;
      
      // Check if it's a quota/rate limit error (429 or OpenAI quota error)
      const isQuotaError = statusCode === 429 || 
                          errorMessage.includes('quota') || 
                          errorMessage.includes('429') ||
                          errorResponse.includes('quota');
      
      // Check if it's a network error
      const isNetworkError = errorMessage.includes('Network') || 
                            errorMessage.includes('timeout') ||
                            errorMessage.includes('ECONNREFUSED');
      
      let userMessage = "Failed to log exercise. Please try again.";
      
      if (isQuotaError) {
        userMessage = "The service is temporarily unavailable due to high demand. Please try again in a few moments. Your exercise has been saved locally and will sync when the service is available.";
        
        // Still save locally as fallback
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const duration = estimateDuration(description);
        const intensity = estimateIntensity(description);
        const calories = estimateCalories(description, duration);
        const exerciseType = getExerciseType(description);
        
        const fallbackActivity = {
          id: Date.now().toString(),
          type: exerciseType,
          calories,
          duration,   
          intensity,
          description,
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: currentDate,
          // logId will be set when synced later via API
        };
        
        addActivity(fallbackActivity);
        console.log("💾 [DescribeExercise] Saved exercise locally as fallback due to quota error");
      } else if (isNetworkError) {
        userMessage = "Network error. Please check your internet connection and try again.";
      } else if (errorResponse) {
        userMessage = errorResponse;
      } else if (errorMessage) {
        userMessage = errorMessage;
      }
      
      Alert.alert(
        "Error",
        userMessage,
        [
          {
            text: "OK",
            onPress: () => {
              // If it was a quota error and we saved locally, navigate to dashboard
              if (isQuotaError) {
                router.push({
                  pathname: '/(tabs)/',
                  params: { refresh: Date.now().toString() }
                });
              }
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async () => {
    if (!description.trim()) return;
  
    if (isEditMode) {
      // EDIT EXISTING
      try {
        setLoading(true);
        const duration = estimateDuration(description);
        const intensity = estimateIntensity(description);
        const calories = estimateCalories(description, duration);
        const type = getExerciseType(description);
        
        // Get current date
        const now = new Date();
        const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Update in backend if logId exists
        const logIdToUpdate = existingActivity?.logId || activityLogId;
        if (logIdToUpdate) {
          try {
            console.log("📝 [DescribeExercise] Updating exercise in backend:", {
              logId: logIdToUpdate,
              description,
              date: currentDate
            });
            
            // Update via API using log-by-describe (which accepts logId for updates)
            const apiResponse = await wellnessApi.logExerciseByDescribe({
              logId: logIdToUpdate,
              description,
              date: currentDate
            });
            
            console.log("📝 [DescribeExercise] Update API Response:", JSON.stringify(apiResponse, null, 2));
            
            // Verify response indicates success
            const isSuccess = (apiResponse?.success === true || apiResponse?.flag === true) ||
                              (apiResponse?.message && (
                                apiResponse.message.toLowerCase().includes('updated') ||
                                apiResponse.message.toLowerCase().includes('saved') ||
                                apiResponse.message.toLowerCase().includes('logged')
                              ));
            
            if (!isSuccess) {
              console.warn("⚠️ [DescribeExercise] Update API response may indicate failure:", apiResponse);
            } else {
              console.log("✅ [DescribeExercise] Exercise updated in backend:", logIdToUpdate);
            }
          } catch (apiError: any) {
            console.error("❌ [DescribeExercise] Error updating in backend:", apiError);
            Alert.alert(
              "Warning",
              "Exercise was updated locally but failed to sync with server. " + 
              (apiError?.response?.data?.message || apiError?.message || "Please try again later.")
            );
            // Continue with local update even if API fails
          }
        }
        
        // Update in context
        updateActivity(activityId as string, {
          description,
          duration,
          intensity,
          calories,
          type,
        });
        
        Alert.alert(
          "Success! ✅",
          "Exercise updated successfully!",
          [
            {
              text: "OK",
              onPress: async () => {
                // Small delay to ensure backend has processed the request
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push({
                  pathname: '/(tabs)/',
                  params: { refresh: Date.now().toString() }
                });
              }
            }
          ],
          { cancelable: false }
        );
      } catch (error: any) {
        console.error("❌ [DescribeExercise] Error updating exercise:", error);
        Alert.alert(
          "Error",
          error?.message || "Failed to update exercise. Please try again."
        );
      } finally {
        setLoading(false);
      }
    } else {
      // ADD NEW
      await handleAddExercise();
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <MaterialCommunityIcons name="text-box-edit-outline" size={RFValue(18)} color="#111" />
              <Text style={styles.headerTitle}>Describe Exercise</Text>
            </View>
            {isEditMode ? (
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}

          </View>

          {/* Menu Overlay (to close menu when clicking outside) */}
          {isEditMode && showMenu && (
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            >
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  <Text style={styles.menuItemTextDelete}>Delete Exercise</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          

          {/* Input */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe workout time, intensity, etc."
            placeholderTextColor="#999"
            multiline
            style={styles.input}
          />
          {/* Created by AI Button */}
          <TouchableOpacity style={styles.aiButton}>
            <Ionicons name="sparkles-outline" size={RFValue(18)} color="#6C3EB6" />
            <Text style={styles.aiText}>Created by AI</Text>
          </TouchableOpacity>

          {/* Example Box */}
          <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>
            <Text style={{ fontWeight: "bold" }}>Example:</Text> Yoga for 30 mins, stretched and relaxed
          </Text>
        </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBtnWrapper}>
          <TouchableOpacity 
            style={[styles.addBtn, loading && styles.addBtnDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.addBtnText}>
                {isEditMode ? "Update exercise" : "+ Add exercise"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="trash-outline" size={48} color="#FF3B30" style={styles.modalIcon} />
              <Text style={styles.modalTitle}>Delete Exercise?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete this exercise? This action cannot be undone.
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDelete]}
                  onPress={async () => {
                    try {
                      setDeleteLoading(true);
                      
                      // Delete from backend API if logId exists
                      const logIdToDelete = existingActivity?.logId || activityLogId;
                      if (logIdToDelete) {
                        try {
                          await wellnessApi.deleteExerciseLog(logIdToDelete);
                          console.log("✅ Exercise deleted from backend:", logIdToDelete);
                        } catch (apiError: any) {
                          console.error("Error deleting from backend:", apiError);
                          // Continue with local deletion even if API fails
                        }
                      }
                      
                      // Delete from context if exists
                      if (activityId) {
                        deleteActivity(activityId);
                      }
                      
                      setShowDeleteModal(false);
                      router.back();
                    } catch (error: any) {
                      console.error("Error deleting exercise:", error);
                      Alert.alert(
                        "Error",
                        error?.message || "Failed to delete exercise. Please try again."
                      );
                    } finally {
                      setDeleteLoading(false);
                    }
                  }}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalButtonTextDelete}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3F9",
    paddingHorizontal: wp("3%"),
  },
  scrollContent: {
    paddingBottom: hp("15%"),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("2%"),
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#6C3EB6",
    borderRadius: wp("8%"),
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("4%"),
    fontSize: RFValue(14),
    fontWeight: "500",
    minHeight: hp("1%"),
    marginTop: hp("1%"),
    textAlignVertical: "top",
  },
  previewBox: {
    backgroundColor: "#E8F4FF",
    borderWidth: 1,
    borderColor: "#6C3EB6",
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginTop: hp("2%"),
  },
  previewTitle: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    color: "#6C3EB6",
    marginBottom: hp("1%"),
  },
  previewText: {
    fontSize: RFValue(12),
    color: "#333",
    marginBottom: hp("0.5%"),
  },
  previewLabel: {
    fontWeight: "600",
    color: "#555",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#6C3EB6",
    borderWidth: 1.3,
    paddingVertical: hp("1.2%"),
    paddingHorizontal: wp("4%"),
    marginTop: hp("2%"),
    borderRadius: wp("8%"),
    alignSelf: "flex-start",
  },
  aiText: {
    marginLeft: wp("1.5%"),
    fontSize: RFValue(14),
    color: "#6C3EB6",
    fontWeight: "500",
  },
  exampleBox: {
    backgroundColor: "#ECE8F1",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3%"),
    marginTop: hp("2%"),
    borderRadius: wp("3%"),
  },
  exampleText: {
    fontSize: RFValue(12),
    color: "#555",
    lineHeight: RFValue(18),
  },
  bottomBtnWrapper: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? hp("2%") : hp("1%"),
    left: 0,
    right: 0,
    paddingHorizontal: wp("%"),
  },
  addBtn: {
    backgroundColor: "#4B1F8C",
    paddingVertical: hp("2%"),
    borderRadius: wp("8%"),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4B1F8C",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addBtnDisabled: {
    backgroundColor: "#CCCCCC",
    shadowColor: "#CCCCCC",
  },
  addBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: RFValue(14),
    letterSpacing: 0.3,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  menuDropdown: {
    position: "absolute",
    top: hp("8%"),
    right: wp("3%"),
    backgroundColor: "#FFF",
    borderRadius: wp("3%"),
    paddingVertical: hp("1%"),
    minWidth: wp("30%"),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    zIndex: 101,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("4%"),
    gap: wp("3%"),
  },
  menuItemTextDelete: {
    fontSize: RFValue(14),
    color: "#FF3B30",
    fontWeight: "400",
  },
  activityPreview: {
    backgroundColor: "#E8F4FF",
    borderRadius: wp("4%"),
    padding: wp("4%"),
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  activityPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp("1%"),
  },
  activityPreviewLabel: {
    fontSize: RFValue(13),
    color: "#666",
    fontWeight: "600",
  },
  activityPreviewValue: {
    fontSize: RFValue(13),
    color: "#111",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: wp("6%"),
    padding: wp("6%"),
    width: wp("85%"),
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: hp("2%"),
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: "700",
    color: "#111",
    marginBottom: hp("1%"),
  },
  modalMessage: {
    fontSize: RFValue(14),
    color: "#666",
    textAlign: "center",
    marginBottom: hp("3%"),
    lineHeight: RFValue(20),
  },
  modalButtons: {
    flexDirection: "row",
    gap: wp("3%"),
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp("1.5%"),
    borderRadius: wp("4%"),
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalButtonDelete: {
    backgroundColor: "#FF3B30",
  },
  modalButtonTextCancel: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#111",
  },
  modalButtonTextDelete: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#FFF",
  },
});