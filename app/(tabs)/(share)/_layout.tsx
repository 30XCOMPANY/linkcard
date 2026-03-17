import { Stack } from "expo-router/stack";

export default function ShareLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Smart Share" }} />
    </Stack>
  );
}
