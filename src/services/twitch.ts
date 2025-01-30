import tmi from "tmi.js";
import { useStore } from "@/store";

export class TwitchService {
  private client: tmi.Client;
  private channelName: string;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: process.env.NEXT_PUBLIC_USERNAME || "ollama_bot",
        password: process.env.NEXT_PUBLIC_OAUTH || "oauth:1234567890",
      },
      channels: [channelName],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on("message", (channel, tags, message, self) => {
      if (self) return;

      const username = tags.username || "";
      const messageText = message.toLowerCase();

      // Handle player pool commands
      if (messageText === "!player1") {
        useStore.getState().addToPool(1, username);
      } else if (messageText === "!player2") {
        useStore.getState().addToPool(2, username);
      } else if (messageText === "!player3") {
        useStore.getState().addToPool(3, username);
      }

      // Handle TTS messages for active players
      const players = useStore.getState().players;
      Object.entries(players).forEach(([playerNum, player]) => {
        if (player.username === username && player.ttsEnabled) {
          // Emit TTS event
          this.onTTSMessage?.({
            message: message,
            voice: player.voice,
            playerNumber: parseInt(playerNum),
          });
        }
      });
    });
  }

  public onTTSMessage?: (data: {
    message: string;
    voice: string;
    playerNumber: number;
  }) => void;

  public async connect() {
    try {
      await this.client.connect();
      console.log("Connected to Twitch chat");
    } catch (error) {
      console.error("Failed to connect to Twitch chat:", error);
    }
  }

  public async disconnect() {
    try {
      await this.client.disconnect();
      console.log("Disconnected from Twitch chat");
    } catch (error) {
      console.error("Failed to disconnect from Twitch chat:", error);
    }
  }
}
