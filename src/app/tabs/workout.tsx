import { useCallback, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router, useFocusEffect, type Href } from "expo-router";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import NumberPickerModal from "../../components/NumberPickerModal";
import SetCard from "../../components/SetCard";

import { Workout } from "../../types/Workout";
import { WorkoutExercise } from "../../types/WorkoutExercise";
import { WorkoutSet } from "../../types/WorkoutSet";

export default function WorkoutScreen() {
  const [weight, setWeight] = useState("185");

  const [reps, setReps] = useState("8");

  const [exercise, setExercise] = useState("");

  const [showWeightPicker, setShowWeightPicker] = useState(false);

  const [showRepsPicker, setShowRepsPicker] = useState(false);

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );

  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [workoutName, setWorkoutName] = useState("");

  const [editingExerciseName, setEditingExerciseName] = useState<string | null>(
    null,
  );

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const weightValues = Array.from({ length: 81 }, (_, i) => (i + 1) * 5);

  const repValues = Array.from({ length: 50 }, (_, i) => i + 1);

  const currentExercise = workoutExercises.find(
    (item) => item.name === exercise,
  );

  const sets = currentExercise?.sets ?? [];

  useEffect(() => {
    async function loadWorkout() {
      const savedWorkout = await AsyncStorage.getItem("currentWorkout");

      if (savedWorkout !== null) {
        setWorkoutExercises(JSON.parse(savedWorkout));
      }
    }

    loadWorkout();
  }, []);

  useEffect(() => {
    async function loadWorkoutName() {
      const savedWorkoutName = await AsyncStorage.getItem("currentWorkoutName");

      if (savedWorkoutName !== null) {
        setWorkoutName(savedWorkoutName);
      }
    }
    loadWorkoutName();
  }, []);

  useEffect(() => {
    async function loadStartTime() {
      const savedStarttime = await AsyncStorage.getItem(
        "currentWorkoutStartTime",
      );

      if (savedStarttime !== null) {
        setWorkoutStartTime(Number(savedStarttime));
      } else {
        const startTime = Date.now();

        setWorkoutStartTime(startTime);

        await AsyncStorage.setItem(
          "currentWorkoutStartTime",
          startTime.toString(),
        );
      }
    }
    loadStartTime();
  }, []);

  useEffect(() => {
    if (workoutStartTime === null) {
      return;
    }

    const startTime = workoutStartTime;

    function updateElapsedTime() {
      const secondsPassed = Math.floor((Date.now() - startTime) / 1000);

      setElapsedSeconds(secondsPassed);
    }

    updateElapsedTime();

    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [workoutStartTime]);

  useFocusEffect(
    useCallback(() => {
      async function loadSelectedExercise() {
        const selectedExercise = await AsyncStorage.getItem("selectedExercise");

        if (selectedExercise !== null) {
          setExercise(selectedExercise);

          setEditingSetId(null);

          setEditingExerciseName(null);

          await AsyncStorage.removeItem("selectedExercise");
        }
      }

      loadSelectedExercise();
    }, []),
  );

  async function addSet() {
    if (!exercise) {
      Alert.alert(
        "Choose an exercise",

        "Select an exercise before adding a set.",
      );

      return;
    }

    const newSet: WorkoutSet = {
      id: Date.now().toString(),

      weight,

      reps,
    };

    let updatedExercises: WorkoutExercise[];

    if (editingSetId !== null && editingExerciseName !== null) {
      updatedExercises = workoutExercises.map((item) => {
        if (item.name !== editingExerciseName) {
          return item;
        }

        return {
          ...item,

          sets: item.sets.map((set) =>
            set.id === editingSetId
              ? {
                  ...set,

                  weight,

                  reps,
                }
              : set,
          ),
        };
      });

      setEditingSetId(null);

      setEditingExerciseName(null);
    } else {
      const exerciseAlreadyExists = workoutExercises.some(
        (item) => item.name === exercise,
      );

      if (exerciseAlreadyExists) {
        updatedExercises = workoutExercises.map((item) => {
          if (item.name !== exercise) {
            return item;
          }

          return {
            ...item,

            sets: [...item.sets, newSet],
          };
        });
      } else {
        updatedExercises = [
          ...workoutExercises,

          {
            name: exercise,

            sets: [newSet],
          },
        ];
      }

      setExpandedExercise(exercise);
    }

    setWorkoutExercises(updatedExercises);

    await AsyncStorage.setItem(
      "currentWorkout",

      JSON.stringify(updatedExercises),
    );
  }

  function editSet(set: WorkoutSet, exerciseName: string) {
    setWeight(set.weight);

    setReps(set.reps);

    setEditingSetId(set.id);

    setEditingExerciseName(exerciseName);

    setExercise(exerciseName);

    setExpandedExercise(exerciseName);
  }

  async function deleteSet(id: string, exerciseName: string) {
    const updatedExercises = workoutExercises

      .map((item) => {
        if (item.name !== exerciseName) {
          return item;
        }

        return {
          ...item,

          sets: item.sets.filter((set) => set.id !== id),
        };
      })

      .filter((item) => item.sets.length > 0);

    setWorkoutExercises(updatedExercises);

    await AsyncStorage.setItem(
      "currentWorkout",

      JSON.stringify(updatedExercises),
    );

    const exerciseStillExists = updatedExercises.some(
      (item) => item.name === exerciseName,
    );

    if (!exerciseStillExists) {
      setExpandedExercise(null);

      if (exercise === exerciseName) {
        setExercise("");
      }
    }
  }

  async function removeExercise(exerciseName: string) {
    const updatedExercises = workoutExercises.filter(
      (item) => item.name !== exerciseName,
    );

    setWorkoutExercises(updatedExercises);

    await AsyncStorage.setItem(
      "currentWorkout",

      JSON.stringify(updatedExercises),
    );

    if (exercise === exerciseName) {
      setExercise("");
    }

    if (expandedExercise === exerciseName) {
      setExpandedExercise(null);
    }

    if (editingExerciseName === exerciseName) {
      setEditingSetId(null);

      setEditingExerciseName(null);
    }
  }

  async function savefinishWorkout() {
    if (workoutExercises.length === 0) {
      return;
    }

    const completedWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: workoutName.trim() || undefined,
      duration: elapsedSeconds,
      exercises: workoutExercises,
    };

    const savedHistory = await AsyncStorage.getItem("workoutHistory");

    const workoutHistory: Workout[] =
      savedHistory !== null ? JSON.parse(savedHistory) : [];

    const updatedHistory = [...workoutHistory, completedWorkout];

    await AsyncStorage.setItem(
      "workoutHistory",

      JSON.stringify(updatedHistory),
    );

    await AsyncStorage.removeItem("currentWorkout");
    await AsyncStorage.removeItem("currentWorkoutStartTime");
    await AsyncStorage.removeItem("currentWorkoutName");

    setWorkoutExercises([]);

    setEditingSetId(null);

    setEditingExerciseName(null);

    setExpandedExercise(null);

    setExercise("");

    setWorkoutStartTime(null);
    setElapsedSeconds(0);
    setWorkoutName("");

    router.replace("/" as Href);
  }

  function finishWorkout() {
    if (workoutExercises.length === 0) {
      Alert.alert(
        "No workout yet",

        "Add at least one set before finishing your workout.",
      );

      return;
    }

    Alert.alert(
      "Finish Workout?",

      "This workout will be saved to your workout history.",

      [
        {
          text: "Cancel",

          style: "cancel",
        },

        {
          text: "Finish",

          onPress: savefinishWorkout,
        },
      ],
    );
  }

  const exerciseVolume = sets.reduce((total, set) => {
    return total + Number(set.weight) * Number(set.reps);
  }, 0);

  const totalWorkoutVolume = workoutExercises.reduce(
    (workoutTotal, workoutExercise) => {
      const volumeForThisExercise = workoutExercise.sets.reduce(
        (exerciseTotal, set) => {
          return exerciseTotal + Number(set.weight) * Number(set.reps);
        },

        0,
      );

      return workoutTotal + volumeForThisExercise;
    },

    0,
  );

  function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 36000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  async function updateWorkoutName(name: string) {
    setWorkoutName(name);

    await AsyncStorage.setItem("currentWorkoutName", name);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Pressable
        style={styles.addExerciseButton}
        onPress={() => router.push("/exercise-picker")}
      >
        <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
      </Pressable>

      {workoutStartTime !== null && (
        <View style={styles.workoutTimer}>
          <Text style={styles.timerLabel}>
            Started{" "}
            {new Date(workoutStartTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
        </View>
      )}

      <Text style={styles.label}>Workout Name</Text>
      <TextInput
        style={styles.workoutNameInput}
        placeholder="e.g Push Day"
        placeholderTextColor="#777"
        value={workoutName}
        onChangeText={updateWorkoutName}
      ></TextInput>

      <Text style={styles.title}>{exercise || "Choose an Exercise"}</Text>

      <Text style={styles.label}>Weight</Text>

      <Pressable
        style={styles.valueButton}
        onPress={() => setShowWeightPicker(true)}
      >
        <Text style={styles.valueText}>{weight} lb</Text>
      </Pressable>

      <Text style={styles.label}>Reps</Text>

      <Pressable
        style={styles.valueButton}
        onPress={() => setShowRepsPicker(true)}
      >
        <Text style={styles.valueText}>{reps}</Text>
      </Pressable>

      <Pressable style={styles.addButton} onPress={addSet}>
        <Text style={styles.addButtonText}>
          {editingSetId !== null ? "Update Set" : "Add Set"}
        </Text>
      </Pressable>

      <Text style={styles.volume}>
        {exercise ? `${exercise} Volume: ${exerciseVolume} lb` : ""}
      </Text>

      <Text style={styles.volume}>Workout Volume: {totalWorkoutVolume} lb</Text>

      <Pressable style={styles.finishButton} onPress={finishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </Pressable>

      {workoutExercises.map((workoutExercise) => {
        const isExpanded = expandedExercise === workoutExercise.name;

        return (
          <View key={workoutExercise.name} style={styles.exerciseCard}>
            <Pressable
              style={styles.exerciseHeader}
              onPress={() => {
                setExpandedExercise(isExpanded ? null : workoutExercise.name);

                setExercise(workoutExercise.name);
                setEditingSetId(null);
                setEditingExerciseName(null);
              }}
            >
              <Text style={styles.exerciseTitle}>{workoutExercise.name}</Text>

              <Text style={styles.dropdownArrow}>{isExpanded ? "▲" : "▼"}</Text>
            </Pressable>

            {isExpanded && (
              <View style={styles.exerciseDetails}>
                {workoutExercise.sets.map((set, index) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    index={index}
                    onEdit={() => editSet(set, workoutExercise.name)}
                    onDelete={() => deleteSet(set.id, workoutExercise.name)}
                  />
                ))}

                <Pressable
                  style={styles.removeExerciseButton}
                  onPress={() => {
                    Alert.alert(
                      "Remove Exercise?",
                      `Remove ${workoutExercise.name} from this workout?`,
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: () => removeExercise(workoutExercise.name),
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.removeExerciseButtonText}>
                    Remove Exercise
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      <NumberPickerModal
        visible={showWeightPicker}
        title="Choose Weight"
        value={weight}
        values={weightValues}
        suffix=" lb"
        onChange={setWeight}
        onClose={() => setShowWeightPicker(false)}
      />

      <NumberPickerModal
        visible={showRepsPicker}
        title="Choose Reps"
        value={reps}
        values={repValues}
        onChange={setReps}
        onClose={() => setShowRepsPicker(false)}
      />
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

  addExerciseButton: {
    backgroundColor: "#333",

    padding: 14,

    borderRadius: 10,

    alignItems: "center",

    marginBottom: 20,
  },

  addExerciseButtonText: {
    color: "white",

    fontWeight: "bold",

    fontSize: 16,
  },

  title: {
    fontSize: 32,

    fontWeight: "bold",

    color: "white",

    marginBottom: 30,
  },

  label: {
    color: "#aaa",

    fontSize: 16,

    marginBottom: 8,
  },

  valueButton: {
    backgroundColor: "#222",

    padding: 18,

    borderRadius: 10,

    marginBottom: 20,
  },

  valueText: {
    color: "white",

    fontSize: 20,
  },

  addButton: {
    backgroundColor: "white",

    padding: 16,

    borderRadius: 10,

    alignItems: "center",
  },

  addButtonText: {
    color: "#111",

    fontWeight: "bold",

    fontSize: 16,
  },

  volume: {
    color: "white",

    fontSize: 18,

    marginTop: 25,

    marginBottom: 15,
  },

  exerciseCard: {
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 12,
    marginTop: 16,
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exerciseDetails: {
    marginTop: 16,
  },

  exerciseTitle: {
    color: "white",

    fontSize: 20,

    fontWeight: "bold",
  },

  dropdownArrow: {
    color: "white",

    fontSize: 18,
  },

  finishButton: {
    backgroundColor: "#35c759",

    padding: 16,

    borderRadius: 10,

    alignItems: "center",

    marginTop: 10,

    marginBottom: 10,
  },

  finishButtonText: {
    color: "#111",

    fontWeight: "bold",

    fontSize: 16,
  },

  removeExerciseButton: {
    backgroundColor: "#b3261e",

    padding: 14,

    borderRadius: 10,

    alignItems: "center",

    marginTop: 10,
  },

  removeExerciseButtonText: {
    color: "white",

    fontWeight: "bold",

    fontSize: 15,
  },
  workoutTimer: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  timerLabel: {
    color: "#aaa",
    fontSize: 14,
  },

  timerText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  workoutNameInput: {
    backgroundColor: "#222",
    color: "white",
    padding: 16,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
  },
});
