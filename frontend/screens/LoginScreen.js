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
} from "react-native";

import API from "../api/api";
import { useAppContext } from "../context/AppContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password.",
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await API.post("/login", {
        email: email.trim(),
        password,
      });

      await login(response.data.access_token);

      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: "Home" }],
      // });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Could not connect to the server. Please try again.";

      Alert.alert("Login failed", String(message));
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
        <View style={styles.container}>
          <View style={styles.headingSection}>
            <Text style={styles.brand}>StreetWatch</Text>
            <View style={styles.accentLine} />

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to your account.
            </Text>
          </View>

          <View style={styles.form}>
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
              placeholder="Enter your password"
              placeholderTextColor="#96988F"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && !loading && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log in</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signupLink}>Create account</Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>StreetWatch · Community reporting</Text>
        </View>
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
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 28,
  },
  headingSection: {
    marginBottom: 36,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: "#526B4D",
    marginBottom: 22,
  },
  accentLine: {
    width: 34,
    height: 3,
    backgroundColor: "#526B4D",
    marginBottom: 25,
    borderRadius: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.7,
    color: "#252923",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#74776F",
    marginTop: 9,
  },
  form: {
    gap: 10,
  },
  label: {
    color: "#34382F",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 5,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DEDFD5",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#252923",
    backgroundColor: "#FFFFFF",
    marginBottom: 9,
  },
  loginButton: {
    height: 52,
    backgroundColor: "#526B4D",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  signupSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 28,
    gap: 5,
  },
  signupText: {
    color: "#74776F",
    fontSize: 13,
  },
  signupLink: {
    color: "#526B4D",
    fontSize: 13,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    color: "#999B91",
    fontSize: 11,
    marginTop: 42,
  },
});
