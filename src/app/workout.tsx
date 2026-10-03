import { useState } from "react";

import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import NumberPickerModal from "../components/NumberPickerModal";
import SetCard from "../components/SetCard";
import { WorkoutSet } from "../types/WorkoutSet";

export default function WorkoutScreen() {
  const [weight, setWeight] = useState("185");
  const [reps, setReps] = useState("8");

  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [showRepsPicker, setShowRepsPicker] = useState(false);

  const [sets, setSets] = useState<WorkoutSet[]>([]);

  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const weightValues = Array.from({ length: 81 }, (_, i) => (i + 1) * 5);

  const repValues = Array.from({ length: 50 }, (_, i) => i + 1);

  function addSet() {
    if (editingSetId !== null) {
      setSets(
        sets.map((set) =>
          set.id === editingSetId ? { ...set, weight, reps } : set,
        ),
      );

      setEditingSetId(null);
      return;
    }

    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      weight,
      reps,
    };

    setSets([...sets, newSet]);
  }

  function deleteSet(id: string) {
    setSets(sets.filter((set) => set.id !== id));

    if (editingSetId === id) {
      setEditingSetId(null);
    }
  }

  function editSet(set: WorkoutSet) {
    setWeight(set.weight);
    setReps(set.reps);
    setEditingSetId(set.id);
  }

  const totalVolume = sets.reduce((total, set) => {
    return total + Number(set.weight) * Number(set.reps);
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bench Press</Text>

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

      <Text style={styles.volume}>Total Volume: {totalVolume} lb</Text>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SetCard
            set={item}
            index={index}
            onEdit={editSet}
            onDelete={deleteSet}
          />
        )}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
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
});
