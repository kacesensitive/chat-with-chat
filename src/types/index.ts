export interface Player {
  username: string;
  voice: string; // ElevenLabs voice ID
  ttsEnabled: boolean;
}

export interface VoiceConfig {
  id: string;
  name: string;
}

export interface AppState {
  players: Record<number, Player>;
  setPlayer: (playerNumber: number, player: Player) => void;
  updatePlayerVoice: (playerNumber: number, voice: string) => void;
  updatePlayerTTSEnabled: (playerNumber: number, enabled: boolean) => void;
  playerPools: Record<number, string[]>;
  addToPool: (playerNumber: number, username: string) => void;
  removeFromPool: (playerNumber: number, username: string) => void;
  clearPool: (playerNumber: number) => void;
  availableVoices: VoiceConfig[];
  setAvailableVoices: (voices: VoiceConfig[]) => void;
}
