import { create } from "zustand";
import { AppState, Player } from "@/types";

const DEFAULT_PLAYER: Player = {
  username: "",
  voice: "", // Will be set to the first available voice ID
  ttsEnabled: true,
};

export const useStore = create<AppState>((set) => ({
  players: {
    1: { ...DEFAULT_PLAYER },
    2: { ...DEFAULT_PLAYER },
    3: { ...DEFAULT_PLAYER },
  },
  playerPools: {
    1: [],
    2: [],
    3: [],
  },
  availableVoices: [],
  setAvailableVoices: (voices) => {
    set({ availableVoices: voices });
    // Update default voice for players that don't have one set
    set((state) => ({
      players: Object.entries(state.players).reduce(
        (acc, [key, player]) => ({
          ...acc,
          [key]: {
            ...player,
            voice: player.voice || voices[0]?.id || "",
          },
        }),
        {}
      ),
    }));
  },
  setPlayer: (playerNumber, player) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerNumber]: player,
      },
    })),
  updatePlayerVoice: (playerNumber, voice) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerNumber]: {
          ...state.players[playerNumber],
          voice,
        },
      },
    })),
  updatePlayerTTSEnabled: (playerNumber, ttsEnabled) =>
    set((state) => ({
      players: {
        ...state.players,
        [playerNumber]: {
          ...state.players[playerNumber],
          ttsEnabled,
        },
      },
    })),
  addToPool: (playerNumber, username) =>
    set((state) => ({
      playerPools: {
        ...state.playerPools,
        [playerNumber]: [
          ...new Set([...state.playerPools[playerNumber], username]),
        ],
      },
    })),
  removeFromPool: (playerNumber, username) =>
    set((state) => ({
      playerPools: {
        ...state.playerPools,
        [playerNumber]: state.playerPools[playerNumber].filter(
          (name) => name !== username
        ),
      },
    })),
  clearPool: (playerNumber) =>
    set((state) => ({
      playerPools: {
        ...state.playerPools,
        [playerNumber]: [],
      },
    })),
}));
