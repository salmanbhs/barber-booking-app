import { Stack } from 'expo-router';

export default function BookingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="select-barber" />
      <Stack.Screen name="select-services" />
      <Stack.Screen name="select-time" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="confirmation" />
    </Stack>
  );
}