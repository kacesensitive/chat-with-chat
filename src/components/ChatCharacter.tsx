import React from "react";
import Image from "next/image";

interface ChatCharacterProps {
  characterNumber: number;
  isAnimating: boolean;
  currentMessage?: string;
}

export function ChatCharacter({
  characterNumber,
  isAnimating,
  currentMessage,
}: ChatCharacterProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <Image
          src={`/chat-${characterNumber}.png`}
          alt={`Chat Character ${characterNumber}`}
          width={128}
          height={128}
          className={`transform-origin-bottom hover:animate-[nod_1s_ease-in-out_infinite] ${
            isAnimating ? "animate-[nod_1s_ease-in-out_infinite]" : ""
          }`}
        />
      </div>
      <div className="mt-2 p-2 bg-slate-800 rounded-lg max-w-[400px] min-w-[400px] max-h-[100px] min-h-[100px] text-center">
        <p className="text-sm text-center text-white break-words">
          {currentMessage}
        </p>
      </div>
    </div>
  );
}
