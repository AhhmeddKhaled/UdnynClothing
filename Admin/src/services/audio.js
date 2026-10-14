export function Audio(audio_path) {
  const audioElement = new window.Audio(audio_path);

  audioElement.play().catch((error) => {
    console.error("Audio playback failed:", error);
  });

  return audioElement;
}