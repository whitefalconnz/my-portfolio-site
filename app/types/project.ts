export enum AspectRatio {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
  SQUARE = 'square'
}

interface GalleryItem {
  image: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  image: string;
  aspectRatio: AspectRatio;
  bgColor: string;
  description: string;
  categories: string[];  // Added categories property
}
