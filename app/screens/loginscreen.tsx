import ProgressBar from '@/components/ProgressBar';
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import wellnessApi from "../../api/wellnessApi";

export default function CreateAccountScreen() {
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "570610933402-5fftpss91tlbmeia1fmj7e35196dqi5c.apps.googleusercontent.com",
    iosClientId:
      "570610933402-parjfemd0r2litm640bbhq25amsea71d.apps.googleusercontent.com",
    webClientId:
      "570610933402-abm3tun02jsum8tvhgfgkjtnkod3on0c.apps.googleusercontent.com",

    scopes: ["profile", "email"],
    responseType: "id_token",

    // 👇👇 ADD THIS
    // redirectUri: Google.makeRedirectUri ({
    //   android: "com.calai:/oauthredirect",
    //   ios: "com.calai.ai:/oauthredirect",
    //   native: "com.calai:/oauthredirect",
    // }),
  });



  // Handle backend Google sign-in
  const handleLogin = async (idToken: string) => {
    try {
      const res = await wellnessApi.signInWithGoogle({
        idToken,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const token = res?.token ?? res?.data?.token;
      if (token) {
        await AsyncStorage.setItem("WELLNESS_AUTH_TOKEN", token);
      }

      router.push("/(tabs)");
    } catch (e) {
      Alert.alert("Google Sign-in Failed", "Please try again");
      console.log("Login error:", e);
    }
  };

  useEffect(() => {
    if (response) {
      console.log("GOOGLE FULL RESPONSE = ", response);
    }

    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;

      console.log("ID TOKEN RECEIVED = ", idToken);

      if (!idToken) {
        Alert.alert("Google Login Error", "No ID Token received");
        return;
      }

      handleLogin(idToken);
    }
  }, [response]);



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>

        <View style={styles.headerContainer}>
          <ProgressBar screen="login" noContainer />
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Create an account</Text>
        </View>

        <View style={styles.buttonContainer}>

          {/* Apple Login */}
          <TouchableOpacity
            style={styles.outlinedButton}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)")}
          >
            <AntDesign name="apple" size={24} color="black" />
            <Text style={styles.outlinedButtonText}>Sign in with Apple</Text>
          </TouchableOpacity>

          {/* Google Login */}
          <TouchableOpacity
            style={styles.outlinedButton}
            activeOpacity={0.85}
            onPress={() => promptAsync()}
          >
            <Image
              source={require("../../assets/images/google-logo.png")}
              style={{ width: 18, height: 18 }}
            />
            <Text style={styles.outlinedButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9FAFB" },
  wrapper: { flex: 1 },
  headerContainer: { padding: 24 },

  section: { marginBottom: 8 },
  title: {
    marginBottom: 8,
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 30
  },

  buttonContainer: { marginTop: 200, gap: 20 },
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
    marginRight: 30
  },
  outlinedButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827"
  }
});
