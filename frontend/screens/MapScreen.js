import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import { useFocusEffect } from "@react-navigation/native";
import API from "../api/api";

const CATS = [
  "All",
  "Pothole",
  "Open Manhole",
  "Broken Streetlight",
  "Garbage",
  "Other",
];

const STAGES = ["All", "Reported", "Verified", "In Progress", "Resolved"];

const colors = {
  Reported: "#C34F35",
  Verified: "#C78A22",
  "In Progress": "#2879B5",
  Resolved: "#39864B",
};

export default function MapScreen({ navigation }) {
  const [issues, setIssues] = useState([]);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef(null);

  // Fetch issues whenever screen is opened
  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      API.get("/issues")
        .then((response) => {
          if (active) {
            setIssues(Array.isArray(response.data) ? response.data : []);
          }
        })
        .catch((error) => {
          if (active) {
            Alert.alert(
              "Map error",
              error.response?.data?.detail || error.message,
            );
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  // Apply category and status filters
  const filtered = useMemo(() => {
    return issues.filter(
      (issue) =>
        (category === "All" || issue.category === category) &&
        (status === "All" || issue.status === status),
    );
  }, [issues, category, status]);

  // Convert GPS values into valid map coordinates
  const validIssues = useMemo(() => {
    return filtered
      .map((issue) => ({
        ...issue,
        latitude: Number(issue.latitude),
        longitude: Number(issue.longitude),
      }))
      .filter(
        (issue) =>
          Number.isFinite(issue.latitude) &&
          Number.isFinite(issue.longitude) &&
          issue.latitude >= -90 &&
          issue.latitude <= 90 &&
          issue.longitude >= -180 &&
          issue.longitude <= 180,
      );
  }, [filtered]);

  // Automatically focus map on reported hazards
  useEffect(() => {
    if (!mapReady || loading || validIssues.length === 0) {
      return;
    }

    const coordinates = validIssues.map((issue) => ({
      latitude: issue.latitude,
      longitude: issue.longitude,
    }));

    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion(
        {
          latitude: coordinates[0].latitude,
          longitude: coordinates[0].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        600,
      );
    } else {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 60,
          right: 50,
          bottom: 60,
          left: 50,
        },
        animated: true,
      });
    }
  }, [mapReady, loading, validIssues]);

  const initialIssue = validIssues[0];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hazards on the Map</Text>

      <Text style={styles.sub}>
        Tap a pin to view photos, status and upvotes.
      </Text>

      <Text style={styles.label}>Category</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
      >
        {CATS.map((value) => (
          <Pressable
            key={value}
            onPress={() => setCategory(value)}
            style={[styles.chip, category === value && styles.selected]}
          >
            <Text
              style={{
                color: category === value ? "white" : "#203626",
              }}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Status</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
      >
        {STAGES.map((value) => (
          <Pressable
            key={value}
            onPress={() => setStatus(value)}
            style={[styles.chip, status === value && styles.selected]}
          >
            <Text
              style={{
                color: status === value ? "white" : "#203626",
              }}
            >
              {value}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: initialIssue?.latitude ?? 24.8607,
              longitude: initialIssue?.longitude ?? 67.0011,
              latitudeDelta: 0.07,
              longitudeDelta: 0.07,
            }}
            onMapReady={() => setMapReady(true)}
            showsUserLocation={false}
          >
            {validIssues.map((issue) => (
              <Marker
                key={String(issue.id)}
                coordinate={{
                  latitude: issue.latitude,
                  longitude: issue.longitude,
                }}
                title={`${issue.category} #${issue.id}`}
                description={`${issue.status} - ${
                  issue.upvote_count ?? 0
                } upvotes`}
                pinColor={colors[issue.status] || "red"}
                onCalloutPress={() =>
                  navigation.navigate("IssueDetail", {
                    id: issue.id,
                  })
                }
              />
            ))}
          </MapView>

          <Text style={styles.footer}>
            {validIssues.length} hazard(s) shown
            {"\n"}
            Tap a marker to view details.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F2",
    paddingTop: 40,
  },

  heading: {
    fontSize: 23,
    fontWeight: "700",
    marginHorizontal: 18,
    color: "#253427",
  },

  sub: {
    marginHorizontal: 18,
    marginBottom: 10,
    color: "#5B665B",
  },

  label: {
    marginLeft: 18,
    fontWeight: "600",
    marginTop: 7,
  },

  filters: {
    flexGrow: 0,
    marginVertical: 7,
    maxHeight: 42,
  },

  chip: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#C6CFC4",
    borderRadius: 10,
    marginLeft: 8,
  },

  selected: {
    backgroundColor: "#526B4D",
  },

  map: {
    flex: 1,
  },

  footer: {
    padding: 9,
    textAlign: "center",
    color: "#536351",
  },
});
