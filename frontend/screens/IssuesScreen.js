import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/api";
const CATEGORIES = ["All", "Pothole", "Open Manhole", "Broken Streetlight", "Garbage", "Other"];
const STATUSES = ["All", "Reported", "Verified", "In Progress", "Resolved"];
export default function IssuesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  useFocusEffect(useCallback(() => { let active = true; setLoading(true); API.get("/issues").then(r => { if (active) setItems(r.data); }).catch(e => Alert.alert("Could not load issues", e.message)).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []));
  const filtered = items.filter(i => (category === "All" || i.category === category) && (status === "All" || i.status === status));
  return <ScrollView style={styles.main} contentContainerStyle={{ padding: 20 }}>
    <Text style={styles.title}>Community hazards</Text>
    <Text>Filter by category:</Text>
    <ScrollView horizontal style={styles.filters}>{CATEGORIES.map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.active]}><Text style={{ color: category === c ? "white" : "#334" }}>{c}</Text></Pressable>)}</ScrollView>
    <Text>Filter by status:</Text>
    <ScrollView horizontal style={styles.filters}>{STATUSES.map(c => <Pressable key={c} onPress={() => setStatus(c)} style={[styles.chip, status === c && styles.active]}><Text style={{ color: status === c ? "white" : "#334" }}>{c}</Text></Pressable>)}</ScrollView>
    {loading ? <ActivityIndicator size="large" /> : filtered.length === 0 ? <Text>No hazards found yet.</Text> : filtered.map(item => <Pressable key={item.id} style={styles.card} onPress={() => navigation.navigate("IssueDetail", { id: item.id })}>
      <Text style={styles.name}>{item.category}  ·  #{item.id}</Text><Text>Status: {item.status}</Text><Text>Upvotes: {item.upvote_count}</Text><Text style={{ color: "#547152" }}>View details →</Text>
    </Pressable>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ main: { backgroundColor: "#F7F7F2" }, title: { fontSize: 25, fontWeight: "700", marginBottom: 22 }, filters: { marginVertical: 12 }, chip: { padding: 10, borderRadius: 8, borderWidth: 1, marginRight: 8, borderColor: "#BEC6B8" }, active: { backgroundColor: "#526B4D" }, card: { backgroundColor: "white", padding: 18, borderRadius: 11, marginBottom: 12, gap: 7 }, name: { fontSize: 17, fontWeight: "700" } });
