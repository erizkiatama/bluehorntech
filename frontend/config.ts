// Application Configuration
export const config = {
  // API Configuration
  apiUrl: 'https://bluehorntech-production.up.railway.app',
  
  // Environment
  env: 'development',
  
  // Feature Flags
  enableLocation: true,
  enableNotifications: true,
  
  // Location Settings (matching backend config)
  maxDistanceError: 500, // 500 meters
  maxDistanceWarning: 100, // 100 meters
  maxEarlyClockInSeconds: 900, // 15 minutes
  maxLateClockInSeconds: 1800, // 30 minutes
  minVisitDurationSeconds: 1800, // 30 minutes
};

export default config; 