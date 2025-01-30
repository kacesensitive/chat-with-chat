"use client";

import { useEffect } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { TwitchService } from "@/services/twitch";
import { TTSService } from "@/services/tts";
import { useStore } from "@/store";

export default function Home() {
  const setAvailableVoices = useStore((state) => state.setAvailableVoices);

  useEffect(() => {
    const twitchChannel = process.env.NEXT_PUBLIC_TWITCH_CHANNEL;
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

    if (!twitchChannel || !elevenLabsKey) {
      console.error("Missing environment variables");
      return;
    }

    // Initialize services
    const twitchService = new TwitchService(twitchChannel);
    const ttsService = new TTSService(elevenLabsKey);

    // Fetch available voices
    const fetchVoices = async () => {
      try {
        const voices = await ttsService.getVoices();
        setAvailableVoices(voices);
      } catch (error) {
        console.error("Failed to fetch voices:", error);
      }
    };

    fetchVoices();

    // Set up TTS message handler
    twitchService.onTTSMessage = async ({ message, voice, playerNumber }) => {
      try {
        console.log("TTS message:", message);
        console.log("TTS voice:", voice);
        console.log("TTS player number:", playerNumber);
        await ttsService.speak(message, voice, playerNumber);
      } catch (error) {
        console.error("TTS error:", error);
      }
    };

    twitchService.connect();

    return () => {
      twitchService.disconnect();
      ttsService.dispose();
    };
  }, [setAvailableVoices]);

  return (
    <main className="container mx-auto p-4 space-y-4 bg-transparent">
      <h1 className="text-2xl font-bold text-center mb-8">Chat With Chat</h1>
      <div className="grid grid-cols-3 gap-4">
        <PlayerCard playerNumber={1} />
        <PlayerCard playerNumber={2} />
        <PlayerCard playerNumber={3} />
      </div>
    </main>
  );
}
