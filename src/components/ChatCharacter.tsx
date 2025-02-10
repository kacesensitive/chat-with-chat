import React from "react";
import Image from "next/image";

interface ChatCharacterProps {
  characterNumber: number;
  characterName: string;
  isAnimating: boolean;
  currentMessage?: string;
}

export function ChatCharacter({
  characterNumber,
  characterName,
  isAnimating,
  currentMessage,
}: ChatCharacterProps) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="mt-2 p-2 bg-slate-800 rounded-lg max-w-[400px] min-w-[400px] max-h-[300px] min-h-[300px] text-center flex flex-col items-center justify-between relative">
        <p
          className="text-white break-words w-full"
          style={{
            fontSize:
              currentMessage?.length && currentMessage.length <= 5
                ? "2.5rem"
                : currentMessage?.length && currentMessage.length <= 15
                ? "1.5rem"
                : "1rem",
          }}
        >
          {currentMessage}
        </p>
        <div className="absolute bottom-2 left-2">
          <Image
            src={`/chat-${characterNumber}.png`}
            alt={`Chat Character ${characterNumber}`}
            width={128}
            height={128}
            className={`transform-origin-bottom hover:animate-[talk_0.3s_ease-in-out_infinite] ${
              isAnimating ? "animate-[talk_0.3s_ease-in-out_infinite]" : ""
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
            {characterName || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
