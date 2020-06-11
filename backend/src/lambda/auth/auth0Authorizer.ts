import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

//import { verify, decode } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'

import { JwtPayload } from '../../auth/JwtPayload'
//import { JwtToken } from '../../auth/JwtToken'

// Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
//const jwksUrl = 'https://dev-xw6o1fpa.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJTB9EXYay3IktMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi14dzZvMWZwYS5hdXRoMC5jb20wHhcNMjAwNjAyMDg1OTQxWhcNMzQw
MjA5MDg1OTQxWjAhMR8wHQYDVQQDExZkZXYteHc2bzFmcGEuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5lINAsnLqumE+YxuUoQppx5
lckkXShXXVC8DxsWm8bmRy8EB3fgxmVSxrAtQmAyPn6sA1zQn53235vibZ3rEDkS
RrOC9EbqiioV08QOzd1tBuDB8yaJxHiEZ9TAQQCiIljBB42Kzt7QludgigNbOOPU
sr+CXcbzQZfHr1tmCgx028g8Z+/U11e2CdogyVMj051sYEZ+Z0gzEnwW3pW0yed6
hNOlHPA8WivM4cNevqn2Uz0l0q92ZiG2Pu+RGY2ud0mvId6eF4rBHzW1oG02nV8P
Hr2M2+Um8wfhE4JEo2iDhkktJKlMbiMMePN2oSwZOqJmOGRk4sGYi3Ypqzmh2wID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQvG/iVqjDbnUqZp7LG
xOwYJm+m7jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAJ6yNZlC
ykp5yC+QcWmvjxRpz1RDxl3GPR4LKle2hckXDr9kbeCxEvDlBtoSmEj5mCa7wz/B
06H9n93QIlTMzK+tlrinbYoEtSd/vgFCdf3o7L9tel7TSFZ81ZDEAB3bfwxCqU7m
/3gVZVCNZDyErMbCrpvGFPj09Mfh9Ngv3Mw1sgcobMg+Fx0cRhQ7Lx3ZTCn7UMzu
z6QbJkuodG8P1aKa4GwZkOKAYfX9EhtSBtnTyvth4IkisqpAqgvuGe+MY02eA9UZ
/3EJqSXfTy9Ekh8DNLjYkCUgrhWopu1SkEBa4Osb9ZAXf/AyrEDKhmP7CQ++YXxE
0GNglFXRulDi/Qk=
-----END CERTIFICATE-----`

const logger = createLogger('auth')

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Call verifyToken', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

//async function verifyToken(authHeader: string): Promise<JwtToken> {
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  //return undefined

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  //return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
