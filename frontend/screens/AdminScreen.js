import React, {useCallback,useState} from "react";
import {View,Text,ScrollView,Pressable,Alert,StyleSheet,ActivityIndicator} from "react-native";
import {useFocusEffect} from "@react-navigation/native";
import API from "../api/api";
import {useAppContext} from "../context/AppContext";
const stages=["Reported","Verified","In Progress","Resolved"];
export default function AdminScreen({navigation}) {
 const {token}=useAppContext();
 const [issues,setIssues]=useState([]),[isAdmin,setIsAdmin]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const headers={Authorization:`Bearer ${token}`};
 const reload=useCallback(async()=>{setLoading(true);try{const user=await API.get("/me",{headers});setIsAdmin(!!user.data.is_admin);if(user.data.is_admin){const response=await API.get("/issues");setIssues(response.data)}}catch(e){Alert.alert("Error",String(e.response?.data?.detail||e.message))}finally{setLoading(false)}},[token]);
 useFocusEffect(useCallback(()=>{reload();},[reload]));
 const advance=async issue=>{const next=stages[stages.indexOf(issue.status)+1];if(!next)return;setBusy(true);try{const form=new FormData();form.append("status",next);await API.patch(`/issues/${issue.id}/status`,form,{headers:{...headers,"Content-Type":"multipart/form-data"}});await reload();Alert.alert("Updated",`Issue #${issue.id}: ${next}`)}catch(e){Alert.alert("Failed",String(e.response?.data?.detail||e.message))}finally{setBusy(false)}};
 const remove=issue=>Alert.alert("Remove spam?",`Delete issue #${issue.id} and its reports permanently?`,[{text:"Cancel"},{text:"Delete",style:"destructive",onPress:async()=>{setBusy(true);try{await API.delete(`/issues/${issue.id}`,{headers});await reload()}catch(e){Alert.alert("Failed",String(e.response?.data?.detail||e.message))}finally{setBusy(false)}}}]);
 return <ScrollView contentContainerStyle={styles.page}><Text style={styles.title}>Admin dashboard</Text>{loading?<ActivityIndicator/>:!isAdmin?<Text>Access denied. This account is not an administrator.</Text>:<>{issues.map(issue=><View key={issue.id} style={styles.card}>
  <Text style={styles.name}>{issue.category} #{issue.id}</Text><Text>Status: {issue.status} · Upvotes: {issue.upvote_count}</Text>
  <Pressable onPress={()=>navigation.navigate("IssueDetail",{id:issue.id})}><Text style={styles.link}>View issue details</Text></Pressable>
  {issue.status!=="Resolved"&&<Pressable disabled={busy} style={styles.button} onPress={()=>advance(issue)}><Text style={styles.white}>Move to {stages[stages.indexOf(issue.status)+1]}</Text></Pressable>}
  <Pressable disabled={busy} style={[styles.button,{backgroundColor:"#8D3939"}]} onPress={()=>remove(issue)}><Text style={styles.white}>Remove spam / invalid report</Text></Pressable>
 </View>)}{issues.length===0&&<Text>No issues yet.</Text>}</>}</ScrollView>
}
const styles=StyleSheet.create({page:{padding:20,paddingTop:45,backgroundColor:"#F7F7F2",flexGrow:1},title:{fontSize:26,fontWeight:"700",marginBottom:20},card:{padding:16,backgroundColor:"white",borderRadius:12,marginBottom:12,gap:10},name:{fontSize:18,fontWeight:"700"},link:{color:"#286AA4"},button:{padding:12,backgroundColor:"#526B4D",borderRadius:8,alignItems:"center"},white:{color:"white",fontWeight:"700"}});
