const getVideoDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = src;
    
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    // Fallback in case metadata doesn't load
    video.onerror = () => {
      resolve({
        width: 1920,
        height: 1080
      });
    };
  });
};

export const getImageDimensions = async (src: string): Promise<{ width: number; height: number }> => {
  if (src.endsWith('.webm') || src.endsWith('.mp4')) {
    return getVideoDimensions(src);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = () => {
      // Return default dimensions on error
      resolve({
        width: 400,
        height: 300
      });
    };
    img.src = src;
  });
};

export const calculateAspectRatio = (width: number, height: number) => {
  const ratio = width / height;
  
  // More precise ratio calculations
  if (ratio > 1.7) return { aspectRatio: 'wide', cols: 8, rows: 2 };
  if (ratio > 1.3) return { aspectRatio: 'landscape', cols: 6, rows: 2 };
  if (ratio < 0.6) return { aspectRatio: 'tall', cols: 3, rows: 3 };
  if (ratio < 0.8) return { aspectRatio: 'portrait', cols: 3, rows: 2 };
  return { aspectRatio: 'square', cols: 4, rows: 2 };
};
