import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym Rivals</Text>

      <Text style={styles.subtitle}>Welcome back!</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Rank</Text>
        <Text style={styles.rank}>#2</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Streak</Text>
        <Text style={styles.streak}>🔥 3 days</Text>
      </View>

      <Pressable style={styles.button} onPress={() => router.push("/workout")}>
        <Text style={styles.buttonText}>Start Workout</Text>
      </Pressable>

      <Pressable
        style={styles.historyButton}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.historyButtonText}>Workout History</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: "#111",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },

  subtitle: {
    fontSize: 18,
    color: "#aaa",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,
  },

  cardTitle: {
    color: "#aaa",
    fontSize: 16,
  },

  rank: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 5,
  },

  streak: {
    color: "white",
    fontSize: 24,
    marginTop: 5,
  },

  button: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 17,
  },
  historyButton: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },

  historyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
});
