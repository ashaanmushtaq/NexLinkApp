import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} >
    <Stack.Screen name='(tabs)' />
    <Stack.Screen name='Welcome' />
    <Stack.Screen name='Login' />
    <Stack.Screen name='SignUp' />
    <Stack.Screen name='ForgetPassword' />
    </Stack>
}
