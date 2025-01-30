declare module "elevenlabs-node" {
  export interface VoiceSettings {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  }

  export interface Voice {
    voice_id: string;
    name: string;
    settings?: VoiceSettings;
  }

  export interface GenerateParams {
    text: string;
    voice_id: string;
    voice_settings?: VoiceSettings;
  }

  export class ElevenLabs {
    constructor(config: { apiKey: string });
    generate(params: GenerateParams): Promise<ArrayBuffer>;
    getVoices(): Promise<Voice[]>;
  }
}
