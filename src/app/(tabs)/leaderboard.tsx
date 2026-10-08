import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LeaderboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.text}>Leaderboard coming soon.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
  },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },

  text: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 12,
  },
});