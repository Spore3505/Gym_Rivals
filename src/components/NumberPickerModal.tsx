import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Picker } from "@react-native-picker/picker";

type NumberPickerModalProps = {
  visible: boolean;
  title: string;
  value: string;
  values: number[];
  suffix?: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

export default function NumberPickerModal({
  visible,
  title,
  value,
  values,
  suffix = "",
  onChange,
  onClose,
}: NumberPickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>

          <Picker
            selectedValue={value}
            onValueChange={(newValue) => onChange(newValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {values.map((item) => (
              <Picker.Item
                key={item}
                label={`${item}${suffix}`}
                value={item.toString()}
              />
            ))}
          </Picker>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#222",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  picker: {
    color: "white",
  },

  pickerItem: {
    color: "white",
    fontSize: 22,
  },

  doneButton: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  doneText: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
  },
});
