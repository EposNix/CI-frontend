
export interface ImageData {
  base64: string;
  mimeType: string;
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  remainingGenerations: number;
}
