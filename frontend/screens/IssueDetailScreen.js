import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable, Alert, StyleSheet } from "react-native";
import API from "../api/api";
import { useAppContext } from "../context/AppContext";
export default function IssueDetailScreen({ route }) {
  const { token } = useAppContext();
  const [issue, setIssue] = useState(null);
  const id = route.params.id;
  const load = async () => { try { const r = await API.get(`/issues/${id}`); setIssue(r.data); } catch (e) { Alert.alert("Error", e.message); } };
  useEffect(() => { load(); }, [id]);
  const upvote = async () => { try { const r = await API.post(`/issues/${id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } }); setIssue(r.data); } catch (e) { Alert.alert("Unable to upvote", String(e.response?.data?.detail || e.message)); } };
  if (!issue) return <View style={{ padding: 25 }}><Text>Loading issue...</Text></View>;
  return <ScrollView style={styles.main} contentContainerStyle={{ padding: 20 }}>
    <Text style={styles.title}>{issue.category} #{issue.id}</Text><Text style={styles.text}>Status: {issue.status}</Text><Text style={styles.text}>Upvotes: {issue.upvote_count}</Text>
    <Text style={styles.text}>GPS: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}</Text>
    {issue.status !== "Resolved" && <Pressable onPress={upvote} style={styles.button}><Text style={{ color: "white", fontWeight: "700" }}>Upvote this hazard</Text></Pressable>}
    <Text style={[styles.title, { fontSize: 19, marginTop: 25 }]}>Reports ({issue.reports.length})</Text>
    {issue.reports.map(r => <View key={r.id} style={styles.card}><Image source={{ uri: `${API.defaults.baseURL}${r.photo_url}` }} style={styles.image} /><Text>{r.note || "No additional note"}</Text><Text style={{ color: "#6B746B" }}>{r.created_at.slice(0, 10)}</Text></View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({ main: { backgroundColor: "#F7F7F2" }, title: { fontSize: 25, fontWeight: "700", marginBottom: 16 }, text: { fontSize: 15, marginBottom: 9 }, button: { backgroundColor: "#526B4D", padding: 16, alignItems: "center", borderRadius: 8, marginTop: 10 }, card: { backgroundColor: "white", padding: 12, borderRadius: 10, marginTop: 12, gap: 10 }, image: { width: "100%", height: 210, borderRadius: 8 } });
