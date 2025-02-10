import React from "react";
import Image from "next/image";
import { useSharedState } from "driftdb-react";

export function ChatCharacterOBS({ playerNumber }: { playerNumber: number }) {
  // get the needed data from the useSharedState
  const [sharedStateObject] = useSharedState("sharedStateObject", {
    players: [
      {
        playerNumber: 1,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 1,
        characterName: "Player 1",
      },
      {
        playerNumber: 2,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 2,
        characterName: "Player 2",
      },
      {
        playerNumber: 3,
        currentMessage: "",
        isAnimating: false,
        characterNumber: 3,
        characterName: "Player 3",
      },
    ],
  });

  return (
    <div className="relative flex flex-col items-center">
      <div className="mt-2 p-2 bg-slate-800 rounded-lg max-w-[400px] min-w-[400px] max-h-[300px] min-h-[300px] text-center flex flex-col items-center justify-between relative">
        <p
          className="text-white break-words w-full"
          style={{
            fontSize:
              sharedStateObject.players[playerNumber - 1].currentMessage
                ?.length &&
              sharedStateObject.players[playerNumber - 1].currentMessage
                .length <= 5
                ? "2.5rem"
                : sharedStateObject.players[playerNumber - 1].currentMessage
                    ?.length &&
                  sharedStateObject.players[playerNumber - 1].currentMessage
                    .length <= 15
                ? "1.5rem"
                : "1rem",
          }}
        >
          {sharedStateObject.players[playerNumber - 1].currentMessage}
        </p>
        <div className="absolute bottom-2 left-2">
          <Image
            src={`/chat-${playerNumber}.png`}
            alt={`Chat Character ${playerNumber}`}
            width={128}
            height={128}
            className={`transform-origin-bottom hover:animate-[talk_0.3s_ease-in-out_infinite] ${
              sharedStateObject.players[playerNumber - 1].isAnimating
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
            {sharedStateObject.players[playerNumber - 1].characterName || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
