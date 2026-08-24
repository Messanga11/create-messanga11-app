import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

const SCREEN_OPTIONS = { headerShown: false };

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={SCREEN_OPTIONS} />
      <StatusBar style="dark" />
    </>
  );
}
