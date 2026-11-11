import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppProvider, useAppContext } from "./context/AppContext";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import ReportScreen from "./screens/ReportScreen";
import IssuesScreen from "./screens/IssuesScreen";
import IssueDetailScreen from "./screens/IssueDetailScreen";
import MapScreen from "./screens/MapScreen";
import AdminScreen from "./screens/AdminScreen";
import NotificationSetup from "./components/NotificationSetup";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#526B4D" />
      </View>
    );
  }

  return (
    <>
    {token ? <NotificationSetup /> : null}
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Report" options={{ headerShown: true, title: "Report" }} component={ReportScreen} />
            <Stack.Screen name="Issues" options={{ headerShown: true, title: "Issues" }} component={IssuesScreen} />
            <Stack.Screen name="IssueDetail" options={{ headerShown: true, title: "Issue details" }} component={IssueDetailScreen} />
            <Stack.Screen name="Map" options={{ headerShown: true, title: "Map" }} component={MapScreen} />
            <Stack.Screen name="Admin" options={{ headerShown: true, title: "Admin" }} component={AdminScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
