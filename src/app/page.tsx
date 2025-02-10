"use client";

import { useEffect, useRef } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { TwitchService } from "@/services/twitch";
import { TTSService } from "@/services/tts";
import { useStore } from "@/store";
import { DriftDBProvider } from "driftdb-react";
import { useSharedState } from "driftdb-react";

interface Player {
  playerNumber: number;
  currentMessage: string;
  isAnimating: boolean;
  characterNumber: number;
  characterName: string;
  audioUrl: string;
}

interface SharedState {
  players: Player[];
  audioBlobs: Record<string, string>;
}

const Main = () => {
  const setAvailableVoices = useStore((state) => state.setAvailableVoices);
  const [, setSharedStateObject] = useSharedState<SharedState>(
    "sharedStateObject",
    {
      players: [
        {
          playerNumber: 1,
          currentMessage: "",
          isAnimating: false,
          characterNumber: 1,
          characterName: "Player 1",
          audioUrl: "",
        },
        {
          playerNumber: 2,
          currentMessage: "",
          isAnimating: false,
          characterNumber: 2,
          characterName: "Player 2",
          audioUrl: "",
        },
        {
          playerNumber: 3,
          currentMessage: "",
          isAnimating: false,
          characterNumber: 3,
          characterName: "Player 3",
          audioUrl: "",
        },
      ],
      audioBlobs: {},
    }
  );
  const fetchedAudioRef = useRef<Set<string>>(new Set());

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

    // Handle TTS end event
    const handleTTSEnd = (event: CustomEvent) => {
      const { playerNumber } = event.detail;
      setSharedStateObject((prev) => ({
        ...prev,
        players: prev.players.map((p, index) =>
          index === playerNumber - 1
            ? { ...p, currentMessage: "", isAnimating: false, audioUrl: "" }
            : p
        ),
      }));
    };

    window.addEventListener("tts-end", handleTTSEnd as EventListener);

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

        // Generate a unique key for this audio
        const audioKey = `${message}-${voice}-${Date.now()}`;

        // Check if we've already fetched this audio
        if (fetchedAudioRef.current.has(audioKey)) {
          console.log("Audio already fetched, skipping API call");
          return;
        }

        // Mark this audio as being fetched
        fetchedAudioRef.current.add(audioKey);

        // Fetch audio and get URL
        const audioUrl = await ttsService.fetchAudio(message, voice);

        // Update shared state with the new message, audio URL, and blob
        setSharedStateObject((prev) => ({
          ...prev,
          audioBlobs: {
            ...prev.audioBlobs,
            [audioKey]: audioUrl,
          },
          players: prev.players.map((p, index) =>
            index === playerNumber - 1
              ? {
                  ...p,
                  currentMessage: message,
                  isAnimating: true,
                  audioUrl: audioKey,
                }
              : p
          ),
        }));

        // Play the audio
        await ttsService.playAudio(audioUrl, playerNumber, message);
      } catch (error) {
        console.error("TTS error:", error);
        // Remove from fetched set if there was an error
        fetchedAudioRef.current.delete(`${message}-${voice}-${Date.now()}`);
      }
    };

    twitchService.connect();

    return () => {
      twitchService.disconnect();
      ttsService.dispose();
      window.removeEventListener("tts-end", handleTTSEnd as EventListener);
      // Clear the fetched audio set on cleanup
      fetchedAudioRef.current.clear();
    };
  }, [setAvailableVoices, setSharedStateObject]);

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
};

export default function Home() {
  const dbUrl = "https://api.jamsocket.live/db/IB4pCl9ESAW6jK3IwIw4/";
  return (
    <DriftDBProvider api={dbUrl}>
      <Main />
    </DriftDBProvider>
  );
}
