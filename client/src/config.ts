// Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ziazduhpv6'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map
  domain: 'dev-xw6o1fpa.auth0.com', // Auth0 domain
  clientId: 'NYAw8y3I7Rue29zChejQGxv5HtJkZOFL', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
