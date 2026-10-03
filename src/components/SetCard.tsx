import { Pressable, StyleSheet, Text, View } from "react-native";
import { WorkoutSet } from "../types/WorkoutSet";

type SetCardProps = {
  set: WorkoutSet;
  index: number;
  onEdit: (set: WorkoutSet) => void;
  onDelete: (id: string) => void;
};

export default function SetCard({
  set,
  index,
  onEdit,
  onDelete,
}: SetCardProps) {
  return (
    <View style={styles.setCard}>
      <Text style={styles.setText}>
        Set {index + 1}: {set.weight} lb × {set.reps}
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(set)}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>

        <Pressable onPress={() => onDelete(set.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setCard: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  setText: {
    color: "white",
  },

  actions: {
    flexDirection: "row",
    gap: 16,
  },

  editText: {
    color: "#4da6ff",
    fontWeight: "bold",
  },

  deleteText: {
    color: "#ff6b6b",
    fontWeight: "bold",
  },
});
