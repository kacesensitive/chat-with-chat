export class TTSService {
  private apiKey: string;
  private audioMap: Map<number, HTMLAudioElement> = new Map();
  private urlMap: Map<number, string> = new Map();
  private playedUrls: Set<string> = new Set();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async fetchAudio(text: string, voiceId: string): Promise<string> {
    console.log("fetching audio", text, voiceId);
    try {
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
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error("ElevenLabs TTS error:", error);
      throw error;
    }
  }

  public async playAudio(
    audioUrl: string,
    playerNumber: number,
    text: string,
    isOBS: boolean = false
  ): Promise<void> {
    if (this.playedUrls.has(audioUrl)) {
      console.log("Skipping already played audio URL");
      return;
    }

    // Validate the blob URL before attempting to play
    if (!audioUrl.startsWith("blob:")) {
      throw new Error("Invalid audio URL format - expected blob URL");
    }

    try {
      // Clean up previous audio element for this player if it exists
      if (this.audioMap.has(playerNumber)) {
        const existingAudio = this.audioMap.get(playerNumber)!;
        existingAudio.pause();
        if (this.urlMap.has(playerNumber)) {
          URL.revokeObjectURL(this.urlMap.get(playerNumber)!);
          this.urlMap.delete(playerNumber);
        }
        this.audioMap.delete(playerNumber);
      }

      // Store the new URL
      this.urlMap.set(playerNumber, audioUrl);

      // Create new audio element with autoplay for OBS
      const audio = new Audio();

      // Set up error handling before setting the src
      audio.onerror = () => {
        console.error("Audio error details:", {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
        });
      };

      if (isOBS) {
        audio.autoplay = true;
        // Start muted then unmute after load to bypass autoplay restrictions
        audio.muted = true;
      }

      // Now set the source
      audio.src = audioUrl;

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

      // Add ended event listener to handle when speech is done
      audio.addEventListener("ended", () => {
        window.dispatchEvent(
          new CustomEvent("tts-end", {
            detail: {
              playerNumber,
            },
          })
        );
      });

      // Wait for audio to load and then play
      return new Promise<void>((resolve, reject) => {
        if (!audio) return reject(new Error("Audio not initialized"));

        let hasError = false;

        const errorHandler = () => {
          hasError = true;
          const errorDetails = {
            error: audio.error,
            networkState: audio.networkState,
            readyState: audio.readyState,
          };
          console.error("Audio error details:", errorDetails);
          this.playedUrls.delete(audioUrl);
          reject(
            new Error(`Error loading audio: ${JSON.stringify(errorDetails)}`)
          );
        };

        const loadHandler = async () => {
          if (hasError) return;

          try {
            if (isOBS) {
              // Unmute after load for OBS
              audio.muted = false;
            }
            await audio.play();
            this.playedUrls.add(audioUrl);
            resolve();
          } catch (error) {
            console.error("Play error:", error);
            this.playedUrls.delete(audioUrl);
            reject(error);
          }
        };

        audio.addEventListener("error", errorHandler, { once: true });
        audio.addEventListener("loadeddata", loadHandler, { once: true });

        // Clean up after playback
        audio.onended = () => {
          this.audioMap.delete(playerNumber);
          this.playedUrls.delete(audioUrl);
          audio.removeEventListener("error", errorHandler);
          audio.removeEventListener("loadeddata", loadHandler);
          resolve();
        };
      });
    } catch (error) {
      this.playedUrls.delete(audioUrl);
      console.error("Error playing audio:", error);
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
    // Clean up all audio elements and URLs
    for (const [playerNumber, audio] of this.audioMap.entries()) {
      audio.pause();
      if (this.urlMap.has(playerNumber)) {
        URL.revokeObjectURL(this.urlMap.get(playerNumber)!);
        this.urlMap.delete(playerNumber);
      }
      this.audioMap.delete(playerNumber);
    }
    this.playedUrls.clear();
  }
}
