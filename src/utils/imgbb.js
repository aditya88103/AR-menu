/**
 * ImgBB Image Upload Utility
 * Free permanent image hosting for dishes
 */

const DEFAULT_IMGBB_KEY = '2d9b626a8d8ba39a7b97e28bdf63dc71';

export async function uploadToImgBB(file) {
  if (!file) throw new Error('No file provided for upload');

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_KEY;
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.data) {
      // Use direct image URL (fallback to display_url)
      return result.data.url || result.data.display_url;
    } else {
      throw new Error(result.error?.message || 'Failed to upload image to ImgBB');
    }
  } catch (err) {
    console.error('ImgBB upload error:', err);
    throw err;
  }
}
