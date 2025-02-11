"use client";

import React, { useEffect, useRef } from "react";
import { DriftDBProvider } from "driftdb-react";
import { useSharedState } from "driftdb-react";
import { ChatCharacterOBS } from "@/components/ChatCharacterOBS";
import { TTSService } from "@/services/tts";

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

const PlayerPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const unwrappedParams = React.use(params);
  const playerNumber = parseInt(unwrappedParams.id);
  const [sharedStateObject] = useSharedState<SharedState>("sharedStateObject", {
    players: [
      {
        playerNumber: 1,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 1,
        characterName: "",
        audioUrl: "",
      },
      {
        playerNumber: 2,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 2,
        characterName: "",
        audioUrl: "",
      },
      {
        playerNumber: 3,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 3,
        characterName: "",
        audioUrl: "",
      },
    ],
    audioBlobs: {},
  });
  const ttsServiceRef = useRef<TTSService | null>(null);
  const lastPlayedUrlRef = useRef<string>("");

  useEffect(() => {
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      console.error("Missing ELEVENLABS_API_KEY");
      return;
    }

    // Initialize TTS service if not already initialized
    if (!ttsServiceRef.current) {
      ttsServiceRef.current = new TTSService(elevenLabsKey);
    }

    return () => {
      if (ttsServiceRef.current) {
        ttsServiceRef.current.dispose();
        ttsServiceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ttsServiceRef.current) return;

    const currentPlayer = sharedStateObject.players.find(
      (p) => p.playerNumber === playerNumber
    );

    if (
      currentPlayer?.audioUrl &&
      currentPlayer.isAnimating &&
      currentPlayer.audioUrl !== lastPlayedUrlRef.current
    ) {
      const audioUrl = sharedStateObject.audioBlobs[currentPlayer.audioUrl];
      if (!audioUrl) {
        console.error("Audio blob not found for key:", currentPlayer.audioUrl);
        return;
      }

      console.log("Playing audio in player page:", audioUrl);
      lastPlayedUrlRef.current = currentPlayer.audioUrl;

      ttsServiceRef.current
        .playAudio(audioUrl, playerNumber, currentPlayer.currentMessage, true)
        .catch((error) => {
          console.error("Error playing audio in player page:", error);
          lastPlayedUrlRef.current = "";
        });
    }
  }, [playerNumber, sharedStateObject]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-transparent">
      <ChatCharacterOBS
        playerNumber={playerNumber}
        sharedStateObject={sharedStateObject}
      />
    </div>
  );
};

export default function PlayerPageWrapper({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <DriftDBProvider api="https://api.jamsocket.live/db/IB4pCl9ESAW6jK3IwIw4/">
      <PlayerPage params={params} />
    </DriftDBProvider>
  );
}
