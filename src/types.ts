export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64 data URL
  reasoning?: string;
};

export type MediaState = {
  file: File | null;
  previewUrl: string | null;
  type: 'image' | 'video' | null;
};

