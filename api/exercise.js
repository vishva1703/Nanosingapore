import { apiClient } from './base.js';

export const ExerciseAPI = {
  // Log running exercise
  logRun: (intensity, duration, date = null, logId = null) => 
    apiClient.post('/log-exercise/log-run', { 
      logId, 
      intensity, 
      duration, 
      date 
    }),

  // Log weight lifting
  logWeightLifting: (intensity, duration, date = null, logId = null) => 
    apiClient.post('/log-exercise/log-weight-lifting', { 
      logId, 
      intensity, 
      duration, 
      date 
    }),

  // Log exercise by description
  logByDescribe: (description, date = null, logId = null) => 
    apiClient.post('/log-exercise/log-by-describe', { 
      logId, 
      description, 
      date 
    }),

  // Delete exercise log
  deleteExerciseLog: (logId) => 
    apiClient.delete(`/log-exercise/log/${logId}`),
};