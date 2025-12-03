import ProgressBar from '@/components/ProgressBar';
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
    import api from "../../services/api";
import { signInWithGoogleAPI } from "../../services/auth"; 

const { width } = Dimensions.get("window");

export default function CreateAccountScreen() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "570610933402-tbr7h8pn4asn80vsvaeucbup7d8i4fv7.apps.googleusercontent.com",
    iosClientId: "570610933402-parjfemd0r2litm640bbhq25amsea71d.apps.googleusercontent.com",
    webClientId: "570610933402-abm3tun02jsum8tvhgfgkjtnkod3on0c.apps.googleusercontent.com"
  });
    

  const handleLogin = async (googleToken) => {
    try {
      const res = await signInWithGoogleAPI(googleToken);
      const token = res.data.token;
  
      await AsyncStorage.setItem("auth_token", token);
      global.authToken = token;
  
      router.push("/(tabs)");
    } catch (e) {
      Alert.alert("Google Sign-in Failed", "Please try again");
      console.log(e);
    }
  };
  

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication.idToken;
      handleLogin(idToken);
    }
  }, [response]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        {/* <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="#1F2937" />
                        </TouchableOpacity> */}

                        <ProgressBar screen="login" noContainer={true} />
                    </View>
                </View>
        {/* Title */}
        <View style={styles.section}> 
                 <Text style={styles.title}>Create an account</Text>
</View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Apple Sign-in */}
          <TouchableOpacity
            style={styles.outlinedButton}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)')}
          >
          <AntDesign name="apple" size={24} color="black" />
            <Text style={styles.outlinedButtonText}>Sign in with Apple</Text>
          </TouchableOpacity>


          {/* Google Sign-in */}
          <TouchableOpacity
  style={styles.outlinedButton}
  activeOpacity={0.85}
  onPress={() => promptAsync()}
>
  <Image source={require("../../assets/images/google-logo.png")} style={{ width: 18, height: 18 }} />
  <Text style={styles.outlinedButtonText}>Sign in with Google</Text>
</TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  wrapper: {
 flex: 1,
  },

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
progressTrack: {
  flex: 1,
  height: 8,
  borderRadius: 4,
  backgroundColor: '#E5E7EB',
  overflow: 'hidden',
},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#4B3AAC",
  },

  // Title
  section: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 30,
  },

  // Buttons
  buttonContainer: {
    marginTop: 200,
    gap: 20,
  },
  outlinedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.3,
    borderColor: "#4B3AAC",
    borderRadius: 25,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: "#FFFFFF",
    marginLeft: 30,
    marginRight: 30,
  },
  outlinedButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
});