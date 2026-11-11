import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image, Alert, ActivityIndicator, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import API from "../api/api";
import { useAppContext } from "../context/AppContext";
const CATEGORIES = ["Pothole", "Open Manhole", "Broken Streetlight", "Garbage", "Other"];
export default function ReportScreen({ navigation }) {
  const { token } = useAppContext();
  const [category, setCategory] = useState("");
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState("");
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  async function pickPhoto(camera = false) {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permission needed", "Allow photo access to report a hazard.");
    const result = camera ? await ImagePicker.launchCameraAsync({ quality: .65 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: .65 });
    if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0]);
  }
  async function getGPS() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") return Alert.alert("Location required", "Please allow location access.");
    const result = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setCoords(result.coords);
    return result.coords;
  }
  async function submit() {
    if (!category || !photo) return Alert.alert("Missing details", "Select a category and a photo.");
    if (loading) return;
    setLoading(true);
    try {
      const position = coords || await getGPS();
      if (!position) return;
      const form = new FormData();
      form.append("category", category);
      form.append("latitude", String(position.latitude));
      form.append("longitude", String(position.longitude));
      form.append("note", note);
      form.append("photo", { uri: photo.uri, name: photo.fileName || "hazard.jpg", type: photo.mimeType || "image/jpeg" });
      const response = await API.post("/issues", form, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Report submitted", response.data.merged ? "Nearby hazard found: your report was merged and upvoted." : "A new hazard was created.", [{ text: "View issues", onPress: () => navigation.replace("Issues") }]);
    } catch (error) {
      Alert.alert("Submission failed", String(error.response?.data?.detail || error.message || "Check your server connection."));
    } finally { setLoading(false); }
  }
  return <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Report a street hazard</Text>
    <Text style={styles.label}>1. Select category *</Text>
    <View style={styles.tags}>{CATEGORIES.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.tag, category === c && styles.selected]}><Text style={{ color: category === c ? "white" : "#26382A" }}>{c}</Text></Pressable>)}</View>
    <Text style={styles.label}>2. Add a photo *</Text>
    <View style={styles.row}><Pressable style={styles.button} onPress={() => pickPhoto(true)}><Text style={styles.buttonText}>Take photo</Text></Pressable><Pressable style={styles.button} onPress={() => pickPhoto(false)}><Text style={styles.buttonText}>Gallery</Text></Pressable></View>
    {photo && <Image source={{ uri: photo.uri }} style={{ width: "100%", height: 190, borderRadius: 10, marginTop: 10 }} />}
    <Text style={styles.label}>3. Note (optional)</Text>
    <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Describe the hazard..." multiline maxLength={500} />
    <Text style={styles.label}>4. GPS location *</Text>
    <Pressable style={styles.button} onPress={async () => { try { await getGPS(); } catch (e) { Alert.alert("GPS error", String(e.message)); } }}><Text style={styles.buttonText}>Get my GPS location</Text></Pressable>
    <Text style={styles.caption}>{coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : "Location will also be collected on submit"}</Text>
    <Pressable disabled={loading} onPress={submit} style={[styles.submit, loading && { opacity: .6 }]}>{loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit hazard report</Text>}</Pressable>
  </ScrollView>;
}
const styles = StyleSheet.create({ container: { padding: 22, paddingTop: 45, backgroundColor: "#F7F7F2", flexGrow: 1 }, title: { fontSize: 25, fontWeight: "700", color: "#253427" }, label: { fontWeight: "700", marginTop: 25, marginBottom: 10, color: "#374337" }, tags: { flexDirection: "row", gap: 8, flexWrap: "wrap" }, tag: { borderWidth: 1, borderColor: "#9FAC9A", padding: 11, borderRadius: 9 }, selected: { backgroundColor: "#526B4D" }, row: { flexDirection: "row", gap: 10 }, button: { backgroundColor: "#526B4D", padding: 13, borderRadius: 9, flexGrow: 1, alignItems: "center" }, buttonText: { color: "white", fontWeight: "700" }, input: { backgroundColor: "white", borderColor: "#CDD5CA", borderWidth: 1, minHeight: 90, padding: 12, textAlignVertical: "top", borderRadius: 9 }, caption: { color: "#667466", marginTop: 10 }, submit: { backgroundColor: "#273E2C", padding: 17, borderRadius: 10, alignItems: "center", marginTop: 35 } });
