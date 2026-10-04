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

import NumberPickerModal from "../components/NumberPickerModal";
import SetCard from "../components/SetCard";
import { Workout } from "../types/Workout";
import { WorkoutExercise } from "../types/WorkoutExercise";
import { WorkoutSet } from "../types/WorkoutSet";

export default function WorkoutScreen() {
  const [weight, setWeight] = useState("185");
  const [reps, setReps] = useState("8");
  const [exercise, setExercise] = useState("Bench Press");

  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showRepsPicker, setShowRepsPicker] = useState(false);

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    [],
  );

  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const [editingExerciseName, setEditingExerciseName] = useState<string | null>(
    null,
  );

  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const weightValues = Array.from({ length: 81 }, (_, i) => (i + 1) * 5);
  const repValues = Array.from({ length: 50 }, (_, i) => i + 1);

  const exercises = ["Bench Press", "Squat", "Deadlift"];

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

  async function addSet() {
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      weight,
      reps,
    };

    let updatedExercises: WorkoutExercise[];

    // EDITING AN EXISTING SET
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
    }

    // ADDING A NEW SET
    else {
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
    const updatedExercises = workoutExercises.map((item) => {
      if (item.name !== exerciseName) {
        return item;
      }

      return {
        ...item,
        sets: item.sets.filter((set) => set.id !== id),
      };
    });

    setWorkoutExercises(updatedExercises);

    await AsyncStorage.setItem(
      "currentWorkout",
      JSON.stringify(updatedExercises),
    );
  }

  async function savefinishWorkout() {
    if (workoutExercises.length === 0) {
      return;
    }

    const completedWorkout: Workout = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exercises: workoutExercises,
    };

    const savedHistory = await AsyncStorage.getItem("wokoutHistory");

    const workoutHistory: Workout[] =
      savedHistory !== null ? JSON.parse(savedHistory) : [];

    const updatedHistory = [...workoutHistory, completedWorkout];

    await AsyncStorage.setItem(
      "workoutHistory",
      JSON.stringify(updatedHistory),
    );

    await AsyncStorage.removeItem("currentWorkout");

    setWorkoutExercises([]);
    setEditingSetId(null);
    setEditingExerciseName(null);
    setExpandedExercise(null);
  }

  function finishWorkout() {
    if (workoutExercises.length === 0) {
      Alert.alert(
        "No workout yet",
        "Add atleast one set before finishing your workout.",
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.exerciseRow}>
        {exercises.map((item) => (
          <Pressable
            key={item}
            style={styles.exerciseButton}
            onPress={() => {
              setExercise(item);
              setEditingSetId(null);
              setEditingExerciseName(null);
            }}
          >
            <Text style={styles.exerciseButtonText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.title}>{exercise}</Text>

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
        {exercise} Volume: {exerciseVolume} lb
      </Text>

      <Text style={styles.volume}>Workout Volume: {totalWorkoutVolume} lb</Text>

      <Pressable style={styles.finishButton} onPress={finishWorkout}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </Pressable>

      {workoutExercises.map((workoutExercise) => {
        const isExpanded = expandedExercise === workoutExercise.name;

        return (
          <View
            key={workoutExercise.name}
            style={styles.workoutExerciseSection}
          >
            <Pressable
              style={styles.exerciseHeader}
              onPress={() =>
                setExpandedExercise(isExpanded ? null : workoutExercise.name)
              }
            >
              <Text style={styles.exerciseTitle}>{workoutExercise.name}</Text>

              <Text style={styles.dropdownArrow}>{isExpanded ? "▲" : "▼"}</Text>
            </Pressable>

            {isExpanded &&
              workoutExercise.sets.map((set, index) => (
                <SetCard
                  key={set.id}
                  set={set}
                  index={index}
                  onEdit={() => editSet(set, workoutExercise.name)}
                  onDelete={() => deleteSet(set.id, workoutExercise.name)}
                />
              ))}
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

  exerciseRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  exerciseButton: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
  },

  exerciseButtonText: {
    color: "white",
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

  workoutExerciseSection: {
    marginTop: 16,
  },

  exerciseHeader: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
