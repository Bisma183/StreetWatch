import {useEffect} from "react";
import {Platform} from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import API from "../api/api";
import {useAppContext} from "../context/AppContext";
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
export default function NotificationSetup(){
 const {token}=useAppContext();
 useEffect(()=>{let cancelled=false;async function setup(){
  if(Platform.OS==="web")return;
  try{
   if(Platform.OS==="android")await Notifications.setNotificationChannelAsync("hazard-updates",{name:"Hazard updates",importance:Notifications.AndroidImportance.HIGH});
   const initial=await Notifications.getPermissionsAsync();
   let status=initial.status;
   if(status!=="granted")status=(await Notifications.requestPermissionsAsync()).status;
   if(status!=="granted")return;
   const projectId=Constants.easConfig?.projectId||Constants.expoConfig?.extra?.eas?.projectId;
   if(!projectId){console.warn("Push registration needs EAS projectId; run eas init and build APK");return;}
   const pushToken=(await Notifications.getExpoPushTokenAsync({projectId})).data;
   if(!cancelled)await API.put("/me/push-token",{push_token:pushToken},{headers:{Authorization:`Bearer ${token}`}});
  }catch(e){console.warn("Push token registration skipped:",e.message)}
 }setup();return()=>{cancelled=true};},[token]);
 return null;
}
