// utils/uploadImage.ts
import axios from 'axios';
import { API_URL } from '@/services/api';

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export async function uploadImageToCloudinary(uri: string): Promise<UploadResult> {
  try {
    console.log('Starting upload...', uri);
    console.log('API URL:', `${API_URL}/upload`);
    
    // Create form data
    const formData = new FormData();
    
    // Get file extension from uri
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // CRITICAL: React Native FormData format
    formData.append('file', {
      uri: uri,
      name: filename,
      type: type,
    } as any);

    console.log('FormData created:', { uri, filename, type });

    // Upload using axios instead of fetch
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('Upload success:', response.data);

    if (response.data.success) {
      return {
        success: true,
        url: response.data.url,
        publicId: response.data.publicId,
      };
    } else {
      return {
        success: false,
        error: response.data.error || 'Upload failed',
      };
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Better error messages
    let errorMessage = 'Upload failed';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      console.error('Server error response:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Check your network connection.';
      console.error('No response:', error.request);
    } else {
      // Other error
      errorMessage = error.message || 'Upload failed';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function uploadMultipleImages(uris: string[]): Promise<string[]> {
  const uploadPromises = uris.map(uri => uploadImageToCloudinary(uri));
  const results = await Promise.all(uploadPromises);
  
  // Return only successful uploads
  return results
    .filter(result => result.success && result.url)
    .map(result => result.url!);
}