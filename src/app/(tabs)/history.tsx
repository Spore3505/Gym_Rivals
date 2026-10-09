
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Workout } from "../../types/Workout";

type SetEditor = {
  mode: "add" | "edit";
  workoutId: string;
  exerciseName: string;
  setId?: string;
  weight: string;
  reps: string;
};

export default function HistoryScreen() {
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);

  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    null,
  );

  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(
    null,
  );

  const [editedWorkoutName, setEditedWorkoutName] = useState("");

  const [setEditor, setSetEditor] = useState<SetEditor | null>(null);
  const [savingSet, setSavingSet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadWorkoutHistory() {
        try {
          const savedHistory = await AsyncStorage.getItem("workoutHistory");

          const parsedHistory: Workout[] = savedHistory
            ? JSON.parse(savedHistory)
            : [];

          const sortedHistory = [...parsedHistory].sort(
            (a, b) =>
              new Date(b.date).getTime() -
              new Date(a.date).getTime(),
          );

          if (active) {
            setWorkoutHistory(sortedHistory);
          }
        } catch (error) {
          if (active) {
            Alert.alert("Error", "Could not load workout history.");
          }
        }
      }

      loadWorkoutHistory();

      return () => {
        active = false;
      };
    }, []),
  );

  // DELETE WORKOUT

  async function deleteWorkout(workoutId: string) {
    const updatedHistory = workoutHistory.filter(
      (workout) => workout.id !== workoutId,
    );

    try {
      await AsyncStorage.setItem(
        "workoutHistory",
        JSON.stringify(updatedHistory),
      );

      setWorkoutHistory(updatedHistory);

      if (expandedWorkoutId === workoutId) {
        setExpandedWorkoutId(null);
      }

      if (editingWorkoutId === workoutId) {
        setEditingWorkoutId(null);
        setEditedWorkoutName("");
      }

      if (setEditor?.workoutId === workoutId) {
        setSetEditor(null);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not delete the workout. Please try again.",
      );
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

  // RENAME WORKOUT

  async function saveWorkoutName(workoutId: string) {
    const newName = editedWorkoutName.trim();

    const updatedHistory = workoutHistory.map((workout) =>
      workout.id === workoutId
        ? { ...workout, name: newName }
        : workout,
    );

    try {
      await AsyncStorage.setItem(
        "workoutHistory",
        JSON.stringify(updatedHistory),
      );

      setWorkoutHistory(updatedHistory);
      setEditingWorkoutId(null);
      setEditedWorkoutName("");
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not rename the workout. Please try again.",
      );
    }
  }

  // EDIT SET

  function startEditingSet(
    workoutId: string,
    exerciseName: string,
    setId: string,
    weight: string,
    reps: string,
  ) {
    setSetEditor({
      mode: "edit",
      workoutId,
      exerciseName,
      setId,
      weight,
      reps,
    });
  }

  // ADD SET

  function startAddingSet(
    workoutId: string,
    exerciseName: string,
    weight: string,
    reps: string,
  ) {
    setSetEditor({
      mode: "add",
      workoutId,
      exerciseName,
      weight,
      reps,
    });
  }

  // SAVE ADDED OR EDITED SET

  async function saveSet() {
    if (setEditor === null || savingSet) {
      return;
    }

    const weightText = setEditor.weight.trim();
    const repsText = setEditor.reps.trim();

    const weight = Number(weightText);
    const reps = Number(repsText);

    if (
      weightText === "" ||
      repsText === "" ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      !Number.isInteger(reps) ||
      reps <= 0
    ) {
      Alert.alert(
        "Invalid Set",
        "Enter a weight of 0 or more and a whole number of reps greater than 0.",
      );
      return;
    }

    const {
      mode,
      workoutId,
      exerciseName,
      setId,
    } = setEditor;

    const newSetId = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;

    const updatedHistory = workoutHistory.map((workout) => {
      if (workout.id !== workoutId) {
        return workout;
      }

      return {
        ...workout,
        exercises: workout.exercises.map((exercise) => {
          if (exercise.name !== exerciseName) {
            return exercise;
          }

          if (mode === "add") {
            return {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: newSetId,
                  weight: weightText,
                  reps: repsText,
                },
              ],
            };
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    weight: weightText,
                    reps: repsText,
                  }
                : set,
            ),
          };
        }),
      };
    });

    setSavingSet(true);

    try {
      await AsyncStorage.setItem(
        "workoutHistory",
        JSON.stringify(updatedHistory),
      );

      setWorkoutHistory(updatedHistory);
      setSetEditor(null);
    } catch (error) {
      Alert.alert("Error", "Could not save the set. Please try again.");
    } finally {
      setSavingSet(false);
    }
  }

  // DELETE SET

  async function deleteSet(
    workoutId: string,
    exerciseName: string,
    setId: string,
  ) {
    const updatedHistory = workoutHistory.map((workout) => {
      if (workout.id !== workoutId) {
        return workout;
      }

      const updatedExercises = workout.exercises
        .map((exercise) => {
          if (exercise.name !== exerciseName) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.filter((set) => set.id !== setId),
          };
        })
        .filter((exercise) => exercise.sets.length > 0);

      return {
        ...workout,
        exercises: updatedExercises,
      };
    });

    try {
      await AsyncStorage.setItem(
        "workoutHistory",
        JSON.stringify(updatedHistory),
      );

      setWorkoutHistory(updatedHistory);

      if (
        setEditor?.workoutId === workoutId &&
        setEditor.exerciseName === exerciseName &&
        (setEditor.mode === "add" || setEditor.setId === setId)
      ) {
        setSetEditor(null);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not delete the set. Please try again.",
      );
    }
  }

  function confirmDeleteSet(
    workoutId: string,
    exerciseName: string,
    setId: string,
  ) {
    Alert.alert(
      "Delete Set?",
      "Are you sure you want to permanently delete this set?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSet(workoutId, exerciseName, setId),
        },
      ],
    );
  }

  // FORMAT WORKOUT DURATION

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
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Workout History</Text>

        {workoutHistory.length === 0 ? (
          <Text style={styles.emptyText}>
            No completed workouts yet.
          </Text>
        ) : (
          workoutHistory.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const isEditing = editingWorkoutId === workout.id;

            const totalVolume = workout.exercises.reduce(
              (workoutTotal, exercise) => {
                const exerciseVolume = exercise.sets.reduce(
                  (setTotal, set) =>
                    setTotal +
                    Number(set.weight) * Number(set.reps),
                  0,
                );

                return workoutTotal + exerciseVolume;
              },
              0,
            );

            return (
              <View key={workout.id} style={styles.workoutCard}>
                <Pressable
                  style={styles.workoutHeader}
                  onPress={() => {
                    setExpandedWorkoutId(
                      isExpanded ? null : workout.id,
                    );

                    if (
                      isExpanded &&
                      setEditor?.workoutId === workout.id
                    ) {
                      setSetEditor(null);
                    }
                  }}
                >
                  <View>
                    {workout.name ? (
                      <Text style={styles.workoutName}>
                        {workout.name}
                      </Text>
                    ) : null}

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

                  <Text style={styles.arrow}>
                    {isExpanded ? "▲" : "▼"}
                  </Text>
                </Pressable>

                {isExpanded && (
                  <View style={styles.workoutDetails}>
                    {/* RENAME WORKOUT */}

                    {isEditing ? (
                      <View>
                        <TextInput
                          style={styles.renameInput}
                          value={editedWorkoutName}
                          onChangeText={setEditedWorkoutName}
                          placeholder="Workout Name"
                          placeholderTextColor="#777"
                          autoFocus
                        />

                        <Pressable
                          style={styles.renameButton}
                          onPress={() => saveWorkoutName(workout.id)}
                        >
                          <Text style={styles.renameButtonText}>
                            Save Name
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.cancelRenameButton}
                          onPress={() => {
                            setEditingWorkoutId(null);
                            setEditedWorkoutName("");
                          }}
                        >
                          <Text style={styles.cancelRenameText}>
                            Cancel
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.renameButton}
                        onPress={() => {
                          setEditingWorkoutId(workout.id);
                          setEditedWorkoutName(workout.name ?? "");
                        }}
                      >
                        <Text style={styles.renameButtonText}>
                          Rename Workout
                        </Text>
                      </Pressable>
                    )}

                    {/* WORKOUT EXERCISES */}

                    {workout.exercises.map((exercise) => {
                      const editingThisExercise =
                        setEditor?.workoutId === workout.id &&
                        setEditor.exerciseName === exercise.name;

                      const lastSet =
                        exercise.sets[exercise.sets.length - 1];

                      return (
                        <View
                          key={exercise.name}
                          style={styles.exerciseSection}
                        >
                          <Text style={styles.exerciseName}>
                            {exercise.name}
                          </Text>

                          {/* EXISTING SETS */}

                          {exercise.sets.map((set, index) => (
                            <View key={set.id} style={styles.setRow}>
                              <View style={styles.setInfo}>
                                <Text style={styles.setText}>
                                  Set {index + 1}
                                </Text>

                                <Text style={styles.setText}>
                                  {set.weight} lb × {set.reps}
                                </Text>
                              </View>

                              <View style={styles.setActions}>
                                <Pressable
                                  onPress={() =>
                                    startEditingSet(
                                      workout.id,
                                      exercise.name,
                                      set.id,
                                      set.weight,
                                      set.reps,
                                    )
                                  }
                                >
                                  <Text style={styles.editSetText}>
                                    Edit
                                  </Text>
                                </Pressable>

                                <Pressable
                                  onPress={() =>
                                    confirmDeleteSet(
                                      workout.id,
                                      exercise.name,
                                      set.id,
                                    )
                                  }
                                >
                                  <Text style={styles.deleteSetText}>
                                    Delete
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          ))}

                          {/* ADD SET BUTTON */}

                          {!editingThisExercise && (
                            <Pressable
                              style={styles.addSetButton}
                              onPress={() =>
                                startAddingSet(
                                  workout.id,
                                  exercise.name,
                                  lastSet?.weight ?? "185",
                                  lastSet?.reps ?? "8",
                                )
                              }
                            >
                              <Text style={styles.addSetButtonText}>
                                + Add Set
                              </Text>
                            </Pressable>
                          )}

                          {/* ADD / EDIT SET FORM */}

                          {editingThisExercise && setEditor && (
                            <View style={styles.setEditor}>
                              <Text style={styles.editorTitle}>
                                {setEditor.mode === "add"
                                  ? "Add Set"
                                  : "Edit Set"}
                              </Text>

                              <View style={styles.editInputRow}>
                                <View style={styles.editInputGroup}>
                                  <Text style={styles.inputLabel}>
                                    Weight (lb)
                                  </Text>

                                  <TextInput
                                    style={styles.setInput}
                                    keyboardType="decimal-pad"
                                    value={setEditor.weight}
                                    onChangeText={(value) =>
                                      setSetEditor((current) =>
                                        current
                                          ? {
                                              ...current,
                                              weight: value,
                                            }
                                          : null,
                                      )
                                    }
                                    selectTextOnFocus
                                  />
                                </View>

                                <View style={styles.editInputGroup}>
                                  <Text style={styles.inputLabel}>
                                    Reps
                                  </Text>

                                  <TextInput
                                    style={styles.setInput}
                                    keyboardType="number-pad"
                                    value={setEditor.reps}
                                    onChangeText={(value) =>
                                      setSetEditor((current) =>
                                        current
                                          ? {
                                              ...current,
                                              reps: value,
                                            }
                                          : null,
                                      )
                                    }
                                    selectTextOnFocus
                                  />
                                </View>
                              </View>

                              <View style={styles.setActionRow}>
                                <Pressable
                                  style={styles.saveSetButton}
                                  onPress={saveSet}
                                  disabled={savingSet}
                                >
                                  <Text style={styles.saveSetText}>
                                    {savingSet
                                      ? "Saving..."
                                      : setEditor.mode === "add"
                                        ? "Add Set"
                                        : "Save Set"}
                                  </Text>
                                </Pressable>

                                <Pressable
                                  style={styles.cancelSetButton}
                                  onPress={() => setSetEditor(null)}
                                  disabled={savingSet}
                                >
                                  <Text style={styles.cancelSetText}>
                                    Cancel
                                  </Text>
                                </Pressable>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}

                    {workout.exercises.length === 0 && (
                      <Text style={styles.emptyText}>
                        No exercises remaining in this workout.
                      </Text>
                    )}

                    {/* DELETE WORKOUT */}

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() =>
                        confirmDeleteWorkout(workout.id)
                      }
                    >
                      <Text style={styles.deleteButtonText}>
                        Delete Workout
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111",
  },

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

  duration: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
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

  workoutName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  workoutDetails: {
    marginTop: 16,
  },

  exerciseSection: {
    marginTop: 16,
  },

  exerciseName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },

  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  setInfo: {
    flex: 1,
    gap: 3,
  },

  setText: {
    color: "#aaa",
    fontSize: 15,
  },

  setActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginLeft: 8,
  },

  editSetText: {
    color: "#4da6ff",
    fontSize: 14,
    fontWeight: "bold",
  },

  deleteSetText: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "bold",
  },

  addSetButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  addSetButtonText: {
    color: "#4da6ff",
    fontSize: 15,
    fontWeight: "bold",
  },

  setEditor: {
    backgroundColor: "#303030",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },

  editorTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  editInputRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  editInputGroup: {
    flex: 1,
  },

  inputLabel: {
    color: "#aaa",
    fontSize: 13,
    marginBottom: 5,
  },

  setInput: {
    color: "white",
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },

  setActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  saveSetButton: {
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    flex: 1,
  },

  saveSetText: {
    color: "white",
    fontWeight: "bold",
  },

  cancelSetButton: {
    padding: 12,
    alignItems: "center",
    flex: 1,
  },

  cancelSetText: {
    color: "#aaa",
    fontWeight: "bold",
  },

  renameInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },

  renameButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },

  renameButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  cancelRenameButton: {
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
  },

  cancelRenameText: {
    color: "#aaa",
    fontSize: 14,
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
    marginTop: 10,
  },
});
