import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import API from "../api/api";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      await API.post("/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      Alert.alert(
        "Account created",
        "Your account is ready. You can now log in.",
        [
          {
            text: "Continue to login",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Could not connect to the server. Please try again.";

      Alert.alert("Signup failed", String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F2" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹ Back to login</Text>
            </Pressable>

            <View style={styles.headingSection}>
              <Text style={styles.brand}>StreetWatch</Text>
              <View style={styles.accentLine} />

              <Text style={styles.title}>Create an account</Text>
              <Text style={styles.subtitle}>
                Join your community and help report local issues.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#96988F"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                returnKeyType="next"
              />

              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#96988F"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#96988F"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />

              <Pressable
                style={({ pressed }) => [
                  styles.signupButton,
                  pressed && !loading && styles.buttonPressed,
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Create account</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log in</Text>
              </Pressable>
            </View>

            <Text style={styles.footer}>StreetWatch · Community reporting</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 30,
    paddingVertical: 5,
  },
  backText: {
    color: "#626B5D",
    fontSize: 13,
    fontWeight: "600",
  },
  headingSection: {
    marginBottom: 28,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#526B4D",
    marginBottom: 20,
  },
  accentLine: {
    width: 34,
    height: 3,
    backgroundColor: "#526B4D",
    marginBottom: 23,
    borderRadius: 2,
  },
  title: {
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: "#252923",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#74776F",
    marginTop: 9,
  },
  form: {
    gap: 9,
  },
  label: {
    color: "#34382F",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  input: {
    height: 51,
    borderWidth: 1,
    borderColor: "#DEDFD5",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#252923",
    backgroundColor: "#FFFFFF",
    marginBottom: 7,
  },
  signupButton: {
    height: 52,
    backgroundColor: "#526B4D",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 26,
    gap: 5,
  },
  loginText: {
    color: "#74776F",
    fontSize: 13,
  },
  loginLink: {
    color: "#526B4D",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#999B91",
    fontSize: 11,
    marginTop: 30,
  },
});
