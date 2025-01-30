import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useStore } from "@/store";
import { ChatCharacter } from "./ChatCharacter";

interface PlayerCardProps {
  playerNumber: number;
}

interface TTSEvent extends CustomEvent {
  detail: { playerNumber: number; message?: string };
}

interface TTSEndEvent extends CustomEvent {
  detail: { playerNumber: number };
}

export function PlayerCard({ playerNumber }: PlayerCardProps) {
  const [username, setUsername] = React.useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const {
    players,
    setPlayer,
    updatePlayerVoice,
    updatePlayerTTSEnabled,
    playerPools,
    clearPool,
    availableVoices,
  } = useStore();

  const player = players[playerNumber];
  const pool = playerPools[playerNumber];

  // Subscribe to TTS events
  useEffect(() => {
    const handleTTS = (event: TTSEvent) => {
      if (event.detail.playerNumber === playerNumber) {
        setIsAnimating(true);
        setCurrentMessage(event.detail.message || "");
      }
    };

    const handleTTSEnd = (event: TTSEndEvent) => {
      if (event.detail.playerNumber === playerNumber) {
        setIsAnimating(false);
        setCurrentMessage("");
      }
    };

    window.addEventListener("tts-event", handleTTS as EventListener);
    window.addEventListener("tts-end", handleTTSEnd as EventListener);

    return () => {
      window.removeEventListener("tts-event", handleTTS as EventListener);
      window.removeEventListener("tts-end", handleTTSEnd as EventListener);
    };
  }, [playerNumber]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      setPlayer(playerNumber, {
        ...player,
        username: username.toLowerCase(),
      });
      setUsername("");
    }
  };

  const pickRandomUser = () => {
    console.log(pool);
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      const randomUser = pool[randomIndex];
      setPlayer(playerNumber, {
        ...player,
        username: randomUser,
      });
      clearPool(playerNumber);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border p-4 space-y-4 bg-slate-900 w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Player {playerNumber}</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm">TTS Enabled</label>
            <input
              type="checkbox"
              checked={player.ttsEnabled}
              onChange={(e) =>
                updatePlayerTTSEnabled(playerNumber, e.target.checked)
              }
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>

        <form onSubmit={handleUsernameSubmit} className="flex space-x-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="flex-1 rounded-md border px-3 py-2 text-sm text-black"
          />
          <Button type="submit">Set User</Button>
        </form>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Current User: {player.username || "None"}
          </span>
          <Button onClick={pickRandomUser} disabled={pool.length === 0}>
            Pick Random ({pool.length})
          </Button>
        </div>

        <Select
          value={player.voice}
          onValueChange={(value) => updatePlayerVoice(playerNumber, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {availableVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChatCharacter
        characterNumber={playerNumber}
        isAnimating={isAnimating}
        currentMessage={currentMessage}
      />
    </div>
  );
}
