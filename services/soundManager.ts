import { Audio } from "expo-av";

// Maps to the mp3 files shown in the screenshot
type SoundKey =
  | "correct"
  | "wrong"
  | "celebrate"
  | "flipcard"
  | "thinking"
  | "next_previous";

let soundCache: Partial<Record<SoundKey, Audio.Sound>> = {};

const SOUND_FILES: Record<SoundKey, any> = {
  correct: require("../assets/sounds/correct.mp3"),
  wrong: require("../assets/sounds/wrong.mp3"),
  celebrate: require("../assets/sounds/celebrate.mp3"),
  flipcard: require("../assets/sounds/flipcard.mp3"),
  thinking: require("../assets/sounds/thinking.mp3"),
  next_previous: require("../assets/sounds/next_previous(card)swipe.mp3"),
};

export async function playSound(key: SoundKey): Promise<void> {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    // Unload and reload each time to allow rapid replaying
    if (soundCache[key]) {
      await soundCache[key]!.unloadAsync();
      delete soundCache[key];
    }

    const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key], {
      shouldPlay: true,
      volume: 1.0,
    });

    soundCache[key] = sound;

    // Auto-unload when done
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        delete soundCache[key];
      }
    });
  } catch (error) {
    // Graceful fallback — never crash for missing audio
    console.warn(`[SoundManager] Could not play "${key}":`, error);
  }
}

export async function unloadAllSounds(): Promise<void> {
  for (const key of Object.keys(soundCache) as SoundKey[]) {
    try {
      await soundCache[key]?.unloadAsync();
    } catch {}
  }
  soundCache = {};
}
