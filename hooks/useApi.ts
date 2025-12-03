// Custom hook for API calls with loading and error states
import { ApiError, ApiResponse } from '@/utils/apiService';
import { useCallback, useState } from 'react';

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data as T);
        return response;
      } else {
        const apiError: ApiError = {
          message: response.message || 'API request failed',
          data: response.data,
        };
        setError(apiError);
        throw apiError;
      }
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'Network error',
        status: err.status,
        data: err.data,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

