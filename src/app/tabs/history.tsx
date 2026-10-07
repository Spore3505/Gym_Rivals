import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Workout } from "../../types/Workout";

export default function HistoryScreen() {
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadWorkoutHistory() {
      const savedHistory = await AsyncStorage.getItem("workoutHistory");

      if (savedHistory !== null) {
        const parsedHistory: Workout[] = JSON.parse(savedHistory);

        const sortedHistory = parsedHistory.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        setWorkoutHistory(sortedHistory);
      }
    }

    loadWorkoutHistory();
  }, []);

  async function deleteWorkout(workoutId: string) {
    const updatedHistory = workoutHistory.filter(
      (workout) => workout.id !== workoutId,
    );

    setWorkoutHistory(updatedHistory);

    await AsyncStorage.setItem(
      "workoutHistory",
      JSON.stringify(updatedHistory),
    );

    if (expandedWorkoutId === workoutId) {
      setExpandedWorkoutId(null);
    }
  }

  function confirmDeleteWorkout(workoutId: string) {
    Alert.alert(
      "Delete Workout?",
      "This workout will be permanently removed from your history.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkout(workoutId),
        },
      ],
    );
  }

  function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Workout History</Text>

      {workoutHistory.length === 0 ? (
        <Text style={styles.emptyText}>No completed workouts yet.</Text>
      ) : (
        workoutHistory.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;

          const totalVolume = workout.exercises.reduce(
            (workoutTotal, exercise) => {
              const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
                return setTotal + Number(set.weight) * Number(set.reps);
              }, 0);

              return workoutTotal + exerciseVolume;
            },
            0,
          );

          return (
            <View key={workout.id} style={styles.workoutCard}>
              <Pressable
                style={styles.workoutHeader}
                onPress={() =>
                  setExpandedWorkoutId(isExpanded ? null : workout.id)
                }
              >
                <View>
                  {workout.name && (
                    <Text style={styles.workoutName}>{workout.name}</Text>
                  )}

                  <Text style={styles.date}>
                    {new Date(workout.date).toLocaleDateString()}
                  </Text>

                  <Text style={styles.duration}>
                    Duration: {formatDuration(workout.duration ?? 0)}
                  </Text>

                  <Text style={styles.volume}>
                    Total Volume: {totalVolume} lb
                  </Text>
                </View>

                <Text style={styles.arrow}>{isExpanded ? "▲" : "▼"}</Text>
              </Pressable>

              {isExpanded && (
                <View style={styles.workoutDetails}>
                  {workout.exercises.map((exercise) => (
                    <View key={exercise.name} style={styles.exerciseSection}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>

                      {exercise.sets.map((set, index) => (
                        <View key={set.id} style={styles.setRow}>
                          <Text style={styles.setText}>Set {index + 1}</Text>

                          <Text style={styles.setText}>
                            {set.weight} lb × {set.reps}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => confirmDeleteWorkout(workout.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete Workout</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
  },

  workoutCard: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  date: {
    color: "#aaa",
    fontSize: 14,
  },

  volume: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },

  arrow: {
    color: "white",
    fontSize: 18,
  },

  workoutDetails: {
    marginTop: 16,
  },

  exerciseSection: {
    marginTop: 14,
  },

  exerciseName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  setText: {
    color: "#aaa",
    fontSize: 15,
  },

  deleteButton: {
    backgroundColor: "#b3261e",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },

  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },
  workoutName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  duration: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
});
