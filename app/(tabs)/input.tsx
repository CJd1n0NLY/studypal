import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BouncyButton } from "../../components/BouncyButton";
import { Colors } from "../../constants/colors";

export default function InputScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"type" | "scan">("type");
  const [inputText, setInputText] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const characterCount = inputText.length;
  const MAX_CHARS = 3000;

  // Handle camera permissions for the "Scan" tab
  if (activeTab === "scan" && !permission) {
    return <View style={styles.container} />;
  }

  if (activeTab === "scan" && !permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>We need your camera 📸</Text>
          <Text style={styles.subtitle}>
            To scan your study notes, please grant camera access.
          </Text>
          <BouncyButton title="Grant Permission" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Custom Tab Toggle */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "type" && styles.activeTab]}
            onPress={() => setActiveTab("type")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "type" && styles.activeTabText,
              ]}
            >
              ✍️ Type Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "scan" && styles.activeTab]}
            onPress={() => setActiveTab("scan")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "scan" && styles.activeTabText,
              ]}
            >
              📸 Scan Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {activeTab === "type" ? (
            <>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Paste your lecture notes, textbook paragraphs, or rough ideas here..."
                placeholderTextColor={Colors.text.muted}
                value={inputText}
                onChangeText={setInputText}
                maxLength={MAX_CHARS}
                textAlignVertical="top"
              />
              <View style={styles.footer}>
                <Text
                  style={[
                    styles.charCount,
                    characterCount > MAX_CHARS * 0.9
                      ? { color: Colors.warning }
                      : {},
                  ]}
                >
                  {characterCount} / {MAX_CHARS}
                </Text>
                <BouncyButton
                  title="Summarize ✨"
                  onPress={() => {
                    if (inputText.trim().length < 15) {
                      alert(
                        "Please enter a bit more text for Sparky to summarize!",
                      );
                      return;
                    }
                    router.push({
                      pathname: "/summary",
                      params: { text: inputText },
                    });
                  }}
                  style={styles.actionButton}
                />
              </View>
            </>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView style={styles.camera} facing="back" ref={cameraRef}>
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame} />
                  <BouncyButton
                    title="Snap & Read"
                    onPress={() => console.log("Taking photo...")}
                    style={styles.snapButton}
                  />
                </View>
              </CameraView>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    padding: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#EAE8FF", // Slightly darker than background
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: Colors.surface,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.muted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  contentArea: {
    flex: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    fontSize: 16,
    color: Colors.text.dark,
    lineHeight: 24,
    shadowColor: Colors.text.muted,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  charCount: {
    fontSize: 14,
    color: Colors.text.muted,
    fontWeight: "500",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: "80%",
    height: "60%",
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: 16,
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  snapButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: Colors.accent,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.muted,
    textAlign: "center",
    marginBottom: 24,
  },
});
