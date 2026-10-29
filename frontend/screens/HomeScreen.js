import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";

export default function HomeScreen() {
  const { logout } = useAppContext();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F2" />

      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>StreetWatch</Text>
          <Text style={styles.headerSubtitle}>Your neighbourhood</Text>
        </View>

        <Pressable onPress={logout} hitSlop={10}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Welcome back</Text>

        <Text style={styles.intro}>
          Help make your neighbourhood a better place to live.
        </Text>

        <Pressable style={styles.reportButton}>
          <Text style={styles.reportButtonText}>＋ Report an issue</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your community</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>See something that needs fixing?</Text>
          <Text style={styles.infoText}>
            Potholes, broken streetlights, overflowing rubbish bins and other
            local problems can be reported through StreetWatch.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>How it works</Text>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Find a problem</Text>
            <Text style={styles.stepText}>
              Identify an issue on your street.
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Submit a report</Text>
            <Text style={styles.stepText}>Add details and the location.</Text>
          </View>
        </View>

        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Follow the progress</Text>
            <Text style={styles.stepText}>
              Check updates as the issue is reviewed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7DF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  appName: {
    fontSize: 21,
    fontWeight: "700",
    color: "#252923",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#777B72",
    marginTop: 3,
  },

  logout: {
    color: "#626B5D",
    fontSize: 13,
    fontWeight: "600",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 35,
  },

  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: "#252923",
    letterSpacing: -0.6,
  },

  intro: {
    color: "#696D65",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 9,
    marginBottom: 24,
  },

  reportButton: {
    backgroundColor: "#526B4D",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 32,
  },

  reportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  sectionHeader: {
    marginBottom: 14,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#252923",
  },

  infoSection: {
    backgroundColor: "#EEEEE6",
    borderRadius: 8,
    padding: 17,
    marginBottom: 29,
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#30362D",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#666B60",
  },

  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7DF",
  },

  stepNumber: {
    color: "#526B4D",
    fontSize: 14,
    fontWeight: "700",
    width: 30,
    paddingTop: 1,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    color: "#30342E",
    fontSize: 14,
    fontWeight: "600",
  },

  stepText: {
    color: "#777B72",
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
});
