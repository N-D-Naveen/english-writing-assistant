// AWS configuration — values are injected via environment variables
// For local development: set these in .env.local (not committed to Git)
// For Amplify Hosting: set these in the Amplify console environment variables

export const API_URL = import.meta.env.VITE_API_GATEWAY_URL

export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId:       import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      region: 'ap-south-1',
    }
  }
}
