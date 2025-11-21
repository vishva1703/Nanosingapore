import { useRouter } from 'expo-router';
import { ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const backgroundImage = require('@/assets/images/gym.jpg');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    
    router.push({
      pathname: "/screens/onboarding",
      params: { from: "welcome" }
  })
  };

  const handleAlreadyAccount = () => {
    router.push('/screens/loginscreen');
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.bottomSheet}>
            <View style={styles.buttonsRow}>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleGetStarted}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleAlreadyAccount}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Already have an account ?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F4FE',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#4b3aac',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#002A57',
  },
  subtitle: {
    fontSize: 16,
    color: '#335574',
  },
  buttonsRow: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: 'rgba(75, 58, 172, 0.92)',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

