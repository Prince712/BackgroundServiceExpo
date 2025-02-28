import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleService, setAlertInterval ,updateLastTriggered} from "../store/slices/backgroundServiceSlice";
import {
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  setupNotifications,
  playSound,
  sendNotification,
} from "../services/backgroundService";
import Slider from "@react-native-community/slider";
import { Bell, BellOff } from "lucide-react-native";

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { isEnabled, interval, lastTriggered } = useSelector(
    (state: RootState) => state.backgroundService
  );
  const [isLoading, setIsLoading] = useState(false);

  // Background Fetch Setup
  useEffect(() => {
    const setupBackground = async () => {
      setIsLoading(true);
      try {
        if (isEnabled) {
          await registerBackgroundFetch();
        } else {
          await unregisterBackgroundFetch();
        }
      } catch (error) {
        console.error("Background setup error:", error);
      }
      setIsLoading(false);
    };

    setupBackground();
  }, [isEnabled]);

  // Foreground Interval Sound (Runs Only if `isEnabled` is true)
  useEffect(() => {
    if (!isEnabled) return; // Exit if switch is off

    console.log("Setting up foreground interval for playSound...");

    const id = setInterval(() => {
      console.log("Calling playSound...");
      playSound();
      dispatch(updateLastTriggered());
    }, interval * 60000); // Convert minutes to milliseconds

    return () => {
      console.log("Clearing interval...");
      clearInterval(id);
    };
  }, [isEnabled, interval]); // Dependency ensures it updates when `isEnabled` or `interval` changes

  // Toggle Button
  const handleToggle = () => {
    setupNotifications();
    // sendNotification();  // test push notification for ios..
    dispatch(toggleService());
  };

  // Handle Interval Change
  const handleIntervalChange = (value: number) => {
    dispatch(setAlertInterval(Math.round(value)));
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          {isEnabled ? <Bell size={24} color="#4CAF50" /> : <BellOff size={24} color="#757575" />}
          <Text style={styles.title}>Background Alert Service</Text>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Enable Alerts</Text>
          <Switch
            value={isEnabled}
            onValueChange={handleToggle}
            disabled={isLoading}
            trackColor={{ false: "#767577", true: "#AEEA94" }}
            thumbColor={isEnabled ? "#4CAF50" : "#f4f3f4"}
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.label}>Alert Interval: {interval} minutes</Text>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={5}
            step={1}
            value={interval}
            onValueChange={handleIntervalChange}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#000000"
          />
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Status: {isEnabled ? "Active" : "Inactive"}</Text>
          {lastTriggered && (
            <Text style={styles.lastTriggeredText}>
              Last Alert: {new Date(lastTriggered).toLocaleTimeString()}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sliderContainer: { marginBottom: 20 },
  slider: { width: "100%", height: 40 },
  label: { fontSize: 16, color: "#666", marginBottom: 5 },
  statusContainer: { backgroundColor: "#f8f8f8", padding: 15, borderRadius: 10 },
  statusText: { fontSize: 16, color: "#333", marginBottom: 5 },
  lastTriggeredText: { fontSize: 14, color: "#666" },
});
