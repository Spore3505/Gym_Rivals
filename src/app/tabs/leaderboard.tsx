import { StyleSheet, Text, View } from "react-native";

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <Text style={styles.text}>Leaderboard coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
    paddingTop: 70,
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