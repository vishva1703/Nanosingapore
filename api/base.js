import { API_CONFIG } from '../constants/config.js';
import { Storage } from '../utils/storage.js';

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = await Storage.getToken();
    
    console.log(`🌐 [ApiClient] Making ${options.method || 'GET'} request to: ${url}`);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['x-auth-token'] = token;
      console.log(`🔑 [ApiClient] Token included in headers: ${token.substring(0, 20)}...`);
    } else {
      console.warn('⚠️ [ApiClient] No token found - request may fail if authentication is required');
    }

    const config = {
      ...options,
      headers,
    };

    try {
      console.log(`📤 [ApiClient] Request config:`, {
        method: config.method || 'GET',
        url,
        hasBody: !!config.body,
        headers: Object.keys(headers)
      });
      
      const response = await fetch(url, config);
      
      console.log(`📥 [ApiClient] Response status: ${response.status} ${response.statusText}`);
      
      // Try to parse response as JSON
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        console.log(`📥 [ApiClient] Response text:`, text);
        try {
          responseData = JSON.parse(text);
          console.log(`📥 [ApiClient] Parsed JSON response:`, JSON.stringify(responseData, null, 2));
        } catch (parseError) {
          console.error(`❌ [ApiClient] Failed to parse JSON response:`, parseError);
          throw new Error(`Failed to parse JSON response: ${parseError.message}`);
        }
      } else {
        const text = await response.text();
        console.log(`📥 [ApiClient] Non-JSON response:`, text);
        responseData = text;
      }
      
      if (!response.ok) {
        console.error(`❌ [ApiClient] HTTP error! Status: ${response.status}`);
        console.error(`❌ [ApiClient] Response data:`, responseData);
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.response = responseData;
        throw error;
      }
      
      return responseData;
    } catch (error) {
      console.error(`❌ [ApiClient] API request failed for ${url}:`, error);
      console.error(`❌ [ApiClient] Error message:`, error.message);
      if (error.response) {
        console.error(`❌ [ApiClient] Error response:`, error.response);
      }
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // For file uploads
  async postFormData(endpoint, formData) {
    const token = await Storage.getToken();
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'x-auth-token': token,
      },
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();