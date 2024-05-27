export interface Layer {
  id: string;
  width: number;
  height: number;
  rotation: number;
  content: string;
  top: number;
  left: number;

  // src width & height
  _width: number;
  _height: number;

  croppedTop: number; // cropped top px in source image
  croppedLeft: number; // cropped top px in source image
  croppedWidth: number;  // cropped width in px in source image
  croppedHeight: number;  // cropped width in px in source image
}

export interface Sticker {
  id: string,
  layers: Layer[],
  emoji: string;
}

export interface Pack {
  id: string;
  title: string;
  author: string;
  tags: string[];
  stickerIds: string[];
}