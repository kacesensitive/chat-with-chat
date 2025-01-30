export class TTSService {
  private apiKey: string;
  private audioMap: Map<number, HTMLAudioElement> = new Map();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async speak(
    text: string,
    voiceId: string,
    playerNumber?: number
  ): Promise<void> {
    try {
      // Make direct API call to ElevenLabs
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      // Clean up previous audio element for this player if it exists
      if (playerNumber !== undefined && this.audioMap.has(playerNumber)) {
        const existingAudio = this.audioMap.get(playerNumber)!;
        existingAudio.pause();
        URL.revokeObjectURL(existingAudio.src);
        this.audioMap.delete(playerNumber);
      }

      // Create new audio element
      const audio = new Audio(url);

      // Store audio element in map if player number is provided
      if (playerNumber !== undefined) {
        this.audioMap.set(playerNumber, audio);

        // Dispatch event when speech starts
        window.dispatchEvent(
          new CustomEvent("tts-event", {
            detail: {
              playerNumber,
              message: text,
            },
          })
        );
      }

      // Wait for audio to load and then play
      return new Promise<void>((resolve, reject) => {
        if (!audio) return reject(new Error("Audio not initialized"));

        audio.addEventListener("error", () => {
          reject(new Error("Error loading audio"));
        });

        audio.addEventListener("loadeddata", async () => {
          try {
            await audio.play();
          } catch (error) {
            reject(error);
          }
        });

        // Clean up after playback
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (playerNumber !== undefined) {
            this.audioMap.delete(playerNumber);
            // Dispatch end event
            window.dispatchEvent(
              new CustomEvent("tts-end", {
                detail: { playerNumber },
              })
            );
          }
          resolve();
        };
      });
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      throw error;
    }
  }

  public async getVoices() {
    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      interface ElevenLabsVoice {
        voice_id: string;
        name: string;
      }

      const data = await response.json();
      return data.voices.map((voice: ElevenLabsVoice) => ({
        id: voice.voice_id,
        name: voice.name,
      }));
    } catch (error) {
      console.error("Failed to fetch voices:", error);
      throw error;
    }
  }

  public dispose(): void {
    // Clean up all audio elements
    for (const [playerNumber, audio] of this.audioMap.entries()) {
      audio.pause();
      URL.revokeObjectURL(audio.src);
      this.audioMap.delete(playerNumber);
    }
  }
}
