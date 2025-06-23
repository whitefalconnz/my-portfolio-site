// Mapping of original file paths to Cloudinary URLs
const cloudinaryUrlMap: Record<string, string> = {
  // Key files from user's examples
  '/Img_and_Vid/MySafetyTV.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647448/MySafetyTV_bztxps.png',
  '/Img_and_Vid/SmokePreview.webm': 'https://res.cloudinary.com/donmpenyc/video/upload/v1750647471/SmokePreview_vvpznc.webm',
  '/Img_and_Vid/PersonalPaintings/HighaltitudeLandScape(compressed).webp': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647646/HighaltitudeLandScape_compressed_pfsjjx.webp',
  
  // Website portfolio images (header and about page)
  '/Img_and_Vid/WebsitePortfolio.jpg': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647391/WebsitePortfolio_xrmg3a.jpg',
  '/Img_and_Vid/WebsitePortfolio.webp': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647455/WebsitePortfolio_nkbiru.webp',
  
  // Smoke animation project files
  '/Img_and_Vid/Smoke/BearAndCharacterSketches.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647541/BearAndCharacterSketches_cyzlts.png',
  '/Img_and_Vid/Smoke/BackhouseJakob_ANFX301_Project3.mp4': 'https://res.cloudinary.com/donmpenyc/video/upload/v1750647669/BackhouseJakob_ANFX301_Project3_i3twjw.mp4',
  
  // Creative coding project files
  '/Img_and_Vid/Coded_Painting/output_1.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647467/output_1_t5eaap.png',
  '/Img_and_Vid/Coded_Painting/output_2.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647461/output_2_rxf2mi.png',
  '/Img_and_Vid/Coded_Painting/output_3.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647359/output_3_bdvvpq.png',
  
  // Additional output files (might be from different folders)
  '/Img_and_Vid/output_1.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647355/output_1_dkokjs.png',
  '/Img_and_Vid/output_2.png': 'https://res.cloudinary.com/donmpenyc/image/upload/v1750647357/output_2_wxs8ra.png',
  
  // Loading screen video (temporary fallback)
  '/Img_and_Vid/RunCycleLoadingScreen.webm': '/Img_and_Vid/RunCycleLoadingScreen.webm', // Keep local for now
  
  // Add more mappings as needed - we'll update this as we find more files
};

export const getCDNUrl = (path: string): string => {
  // Check if we have a direct mapping for this file
  if (cloudinaryUrlMap[path]) {
    return cloudinaryUrlMap[path];
  }
  
  // If path doesn't start with /Img_and_Vid/, return as-is (for other assets)
  if (!path.startsWith('/Img_and_Vid/')) {
    return path;
  }
  
  // Fallback to local files for development or unmapped files
  console.warn(`No Cloudinary mapping found for: ${path}. Using local file.`);
  return path;
};

// Helper function for optimized images with transformations
export const getOptimizedImageUrl = (path: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
}): string => {
  const baseUrl = getCDNUrl(path);
  
  if (!baseUrl.includes('cloudinary.com')) {
    return baseUrl; // Return original if not using Cloudinary
  }
  
  const { width, height, quality = 'auto', format = 'auto' } = options || {};
  
  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  
  if (transformations.length > 0) {
    // Insert transformations into the URL
    return baseUrl.replace('/upload/', `/upload/${transformations.join(',')}/`);
  }
  
  return baseUrl;
}; 