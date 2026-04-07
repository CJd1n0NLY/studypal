import React, { createContext, useCallback, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast, {
  ToastConfig as RNToastConfig,
} from "react-native-toast-message";
import { Colors } from "../constants/colors";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  emoji?: string;
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// Your exact color palette mappings
const TOAST_STYLES: Record<
  ToastType,
  { bg: string; border: string; text: string; defaultEmoji: string }
> = {
  success: {
    bg: "#E8F5E9",
    border: Colors.success,
    text: "#1B5E20",
    defaultEmoji: "✅",
  },
  error: {
    bg: "#FFEBEE",
    border: Colors.error,
    text: "#B71C1C",
    defaultEmoji: "❌",
  },
  info: {
    bg: "#EAE8FF",
    border: Colors.primary,
    text: Colors.primary,
    defaultEmoji: "💡",
  },
  warning: {
    bg: "#FFF3E0",
    border: Colors.warning,
    text: "#E65100",
    defaultEmoji: "⚠️",
  },
};

// 1. Create a custom UI component for the library to render
const CustomToastRenderer = ({ text1, props }: any) => {
  const type = (props.type as ToastType) || "info";
  const style = TOAST_STYLES[type];
  const emoji = props.emoji ?? style.defaultEmoji;

  return (
    <View
      style={[
        styles.toast,
        { backgroundColor: style.bg, borderLeftColor: style.border },
      ]}
    >
      <Text style={styles.toastEmoji}>{emoji}</Text>
      <Text style={[styles.toastText, { color: style.text }]}>{text1}</Text>
    </View>
  );
};

// 2. Tell the library to route all "custom" types to our UI component
const toastConfig: RNToastConfig = {
  custom: (props) => <CustomToastRenderer {...props} />,
};

// 3. Keep your Provider exactly the same so your other files don't break
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();

  const showToast = useCallback(
    ({ message, type = "info", duration = 3000, emoji }: ToastConfig) => {
      Toast.show({
        type: "custom", // Triggers our CustomToastRenderer
        text1: message, // Passes the message
        visibilityTime: duration,
        props: { type, emoji }, // Passes our extra config
        position: "top",
        topOffset: insets.top > 0 ? insets.top + 10 : 50, // Safely handles the iOS notch dynamically
      });
    },
    [insets.top],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* The library's master component sits at the very top layer of your app */}
      <Toast config={toastConfig} />
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderLeftWidth: 4,
    marginHorizontal: 16,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  toastEmoji: { fontSize: 20, marginRight: 12 },
  toastText: { fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 20 },
});
