/**
 * Simple environment configuration file for the Apple TV app.
 * Switches endpoints based on the build type without requiring native linking.
 */
const PROD_API = 'https://dojo-crm-api-new.managemydojo.com/api/v1';
const STAGING_API = 'https://dojo-crm-api-new.managemydojo.com/api/v1'; // Change to staging when ready

export const ENV = {
  API_BASE_URL: __DEV__ ? STAGING_API : PROD_API,
  IS_DEV: __DEV__,
} as const;
