/**
 * Simple environment configuration file for the Apple TV app.
 * Switches endpoints based on the build type without requiring native linking.
 */
export const ENV = {
  API_BASE_URL: __DEV__
    ? 'https://dojo-crm-api-new.managemydojo.com/api/v1' // Switch to your local/dev URL if applicable, leaving prod for now
    : 'https://dojo-crm-api-new.managemydojo.com/api/v1',
};
