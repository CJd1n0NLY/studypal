export const Typography = {
  header: {
    fontFamily: "SpaceMono-Regular", // Using the template's default font for now
    fontSize: 28,
    fontWeight: "bold" as const,
  },
  title: {
    fontFamily: "SpaceMono-Regular",
    fontSize: 22,
    fontWeight: "600" as const,
  },
  body: {
    fontFamily: "System", // Will fall back to native San Francisco / Roboto
    fontSize: 16,
    fontWeight: "normal" as const,
  },
  caption: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "500" as const,
  },
};
