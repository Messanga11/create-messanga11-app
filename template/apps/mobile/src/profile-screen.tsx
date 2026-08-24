import { canPerform } from "@messanga11/core";
import { buildProfileUiMeta } from "@starter/domain";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UI_META = buildProfileUiMeta(["profile:read", "profile:update"]);

export function ProfileScreen() {
  const [message, setMessage] = useState("Prêt à construire.");
  const canEdit = canPerform(UI_META, "edit");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <Text style={styles.eyebrow}>MESSANGA11 STARTER</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Un domaine partagé, une expérience native.
        </Text>
        <Text style={styles.lede}>
          Expo projette les mêmes contrats et politiques que Next.js.
        </Text>
        <View style={styles.card}>
          <Text style={styles.badge}>Core connecté</Text>
          <Text style={styles.cardTitle}>Profil de démonstration</Text>
          <Text style={styles.meta}>Policy revision : {UI_META.revision}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={!canEdit}
            onPress={() => setMessage("Action reçue. Branche maintenant ton API.")}
            style={canEdit ? styles.button : styles.disabledButton}
          >
            <Text style={styles.buttonLabel}>Modifier le profil</Text>
          </Pressable>
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {message}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: "#2d6a4f",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#171714",
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 50,
    paddingHorizontal: 20,
  },
  buttonLabel: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: "#fffef9",
    borderColor: "#d8d4ca",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 40,
    padding: 24,
  },
  cardTitle: {
    color: "#171714",
    fontSize: 23,
    fontWeight: "700",
    marginTop: 12,
  },
  disabledButton: {
    alignItems: "center",
    backgroundColor: "#171714",
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 50,
    opacity: 0.45,
    paddingHorizontal: 20,
  },
  eyebrow: {
    color: "#68645c",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  lede: { color: "#57534b", fontSize: 17, lineHeight: 25, marginTop: 16 },
  meta: { color: "#68645c", marginTop: 8 },
  safeArea: { backgroundColor: "#f4f2ed", flex: 1 },
  shell: { flex: 1, paddingHorizontal: 24, paddingTop: 36 },
  status: { color: "#57534b", marginTop: 18, minHeight: 22 },
  title: {
    color: "#171714",
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 46,
    marginTop: 10,
  },
});
