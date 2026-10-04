import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#111",
        },
        headerTintColor: "#fff",
        contentStyle: {
          backgroundColor: "#111",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Gym Rivals",
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="workout"
        options={{
          title: "Workout",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Workout History",
        }}
      />
      <Stack.Screen
        name="exercise-picker"
        options={{
          title: "Choose Exercise",
        }}
      />
    </Stack>
  );
}
