import { useActivity } from "@/components/ActivityContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
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

export default function Fixresult() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const { addActivity, setIsAnalyzing } = useActivity();
  const params = useLocalSearchParams();
  const { activityId } = params;
  console.log("PARAM:", activityId);
    const { activities, updateActivity, deleteActivity } = useActivity();
  
  const isEditMode = Boolean(activityId);
  const existingActivity = activities.find(a => a.id === activityId);

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

 
const handleAddExercise = () => {
    if (!description.trim()) return;
  
    setIsAnalyzing(true);   // ⬅ show loading skeleton in Home
  
    setTimeout(() => {
      const duration = estimateDuration(description);
      const intensity = estimateIntensity(description);
      const calories = estimateCalories(description, duration);
      const exerciseType = getExerciseType(description);
  
      const newActivity = {
        id: Date.now().toString(),
        type: exerciseType,
        calories,
        duration,   
        intensity,
        description,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
      };
  
      addActivity(newActivity);
  
      setIsAnalyzing(false);   // hide loading
      router.back();
    }, 2000); // ← simulate AI loading
  };
  const handleSubmit = () => {
    if (!description.trim()) return;
  
    // Get current params to preserve them
    const name = Array.isArray(params.name) ? params.name[0] : (params.name || '');
    const calories = Array.isArray(params.calories) ? params.calories[0] : (params.calories || '');
    const portion = Array.isArray(params.portion) ? params.portion[0] : (params.portion || '');
    const imageUri = Array.isArray(params.imageUri) ? params.imageUri[0] : (params.imageUri || '');
    
    // Navigate back to FoodDetail with ingredients param
    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (calories) queryParams.append('calories', calories);
    if (portion) queryParams.append('portion', portion);
    if (imageUri) queryParams.append('imageUri', imageUri);
    queryParams.append('ingredients', description);
    
    router.push(`/screen1/scanfood/FoodDetail?${queryParams.toString()}`);
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
            <Ionicons name="sparkles-outline" size={RFValue(20)} color="#4B3AAC" />
            <Text style={styles.headerTitle}>Fix Result</Text>
            </View>
            {isEditMode ? (
  <TouchableOpacity onPress={() => {
      deleteActivity(activityId as string);
      router.back();
  }}>
    <Ionicons name="trash-outline" size={24} color="red" />
  </TouchableOpacity>
) : (
  <View style={{ width: 28 }} />
)}

          </View>

          {/* Input */}
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe food ingredients, nutrition details, etc."
            placeholderTextColor="#999"
            multiline
            style={styles.input}
          />
         
          {/* Example Box */}
          <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>
            <Text style={{ fontWeight: "bold" }}>Example:</Text> Chickpeas, tomatoes, onions, garlic, spices, olive oil
          </Text>
        </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBtnWrapper}>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={handleSubmit}
            
          >
            <Text style={styles.addBtnText}>Save Ingredients</Text>
          </TouchableOpacity>
        </View> 
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
    marginTop: hp("2%"),
    textAlignVertical: "top",
    marginBottom: hp("2%"),
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
});