import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SharedStateObject {
  players: Player[];
}

interface Player {
  playerNumber: number;
  currentMessage: string;
  isAnimating: boolean;
  characterNumber: number;
  characterName: string;
}

export function ChatCharacterOBS({
  playerNumber,
  sharedStateObject,
}: {
  playerNumber: number;
  sharedStateObject: SharedStateObject;
}) {
  const [showMute, setShowMute] = useState(true);
  const [currentUserName, setCurrentUserName] = useState("");

  const currentPlayer = sharedStateObject.players.find(
    (p) => p.playerNumber === playerNumber
  );

  useEffect(() => {
    if (currentPlayer?.characterName) {
      setCurrentUserName(currentPlayer.characterName);
    }
  }, [currentPlayer?.characterName]);

  // Only use default name if we can't find the player or if characterName is empty
  const displayName = currentUserName || currentPlayer?.characterName || "";

  return (
    <div className="relative flex flex-col items-center">
      {showMute && (
        <button
          className="absolute top-0 left-0 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
          onClick={() => setShowMute(false)}
        >
          Click to Enable Audio
        </button>
      )}
      <div className="mt-2 p-2 bg-slate-800 rounded-lg max-w-[400px] min-w-[400px] max-h-[300px] min-h-[300px] text-center flex flex-col items-center justify-between relative">
        <p className="text-xl text-white break-words w-full">
          {currentPlayer?.currentMessage || ""}
        </p>
        <div className="absolute bottom-2 left-2">
          <Image
            src={`/chat-${playerNumber}.png`}
            alt={`Chat Character ${playerNumber}`}
            width={128}
            height={128}
            className={`transform-origin-bottom hover:animate-[talk_0.3s_ease-in-out_infinite] ${
              currentPlayer?.isAnimating
                ? "animate-[talk_0.3s_ease-in-out_infinite]"
                : ""
            }`}
          />
          <p
            className="text-3xl font-bold text-center text-white break-words mb-1 font-gaming tracking-wide"
            style={{
              textShadow:
                "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
              WebkitTextStroke: "1px black",
            }}
          >
            {displayName}
          </p>
        </div>
      </div>
    </div>
  );
}
