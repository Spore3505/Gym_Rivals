import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { getExercises } from "../services/exerciseApi";
import { Exercise } from "../types/Exercise";

export default function ExercisePickerScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { source, workoutId } = useLocalSearchParams<{
    source?: string;
    workoutId?: string;
  }>();

  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getExercises();

        setExercises(data);
      } catch (error) {
        console.log(error);
        setError("Could not load exercises.");
      } finally {
        setLoading(false);
      }
    }

    loadExercises();
  }, []);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  async function selectExercise(exercise: Exercise) {
    try {
      if (source === "history" && workoutId) {
        await AsyncStorage.setItem(
          "pendingHistoryExercise",
          JSON.stringify({
            workoutId,
            exerciseName: exercise.name,
          }),
        );
      } else {
        await AsyncStorage.setItem(
          "selectedExercise",
          exercise.name,
        );
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", "Could not select the exercise.");
    }
}

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading exercises...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        placeholderTextColor="#777"
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.exerciseCard}
            onPress={() => selectExercise(item)}
          >
            <Text style={styles.exerciseName}>{item.name}</Text>

            <Text style={styles.exerciseInfo}>{item.primary_muscle}</Text>

            {item.equipment.length > 0 && (
              <Text style={styles.exerciseEquipment}>
                {item.equipment.join(", ")}
              </Text>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },

  centerContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  searchInput: {
    backgroundColor: "#222",
    color: "white",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 16,
  },

  listContent: {
    paddingBottom: 30,
  },

  exerciseCard: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },

  exerciseName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  exerciseInfo: {
    color: "#aaa",
    marginTop: 5,
    textTransform: "capitalize",
  },

  exerciseEquipment: {
    color: "#777",
    marginTop: 3,
  },

  loadingText: {
    color: "white",
    marginTop: 12,
  },

  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
});
