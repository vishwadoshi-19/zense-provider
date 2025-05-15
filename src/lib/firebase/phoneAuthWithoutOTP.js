import { initializeApp, credential as _credential, auth } from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();
// Initialize the Admin SDK (replace with your service account path)
// import serviceAccount from "../../serviceAccountKey.json";

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD2sjfy36fzeA5Y\nT2VEz49MHoX1WhejRqMB7GNYkVGQPr/Uf4GuULbdkeEevSG2Fol9NaP+XGI9SA3S\n2wWElBsfBsaMVXQ5IWuso8he3BrPjAtg5EZgHL1RO6ux1Y7GGLByrhiToIP/XDHy\nwTeBb+yIC5rgk3Qod9mdEEBcwBnQRRQHG00rNeN3vi8jCtNTPRB/nJ54sC141edz\nW5oDcdnhhVFtQMe8vEsUngmRKNeyKYQhKRuZw4T4Co1la9yd7ZUyk1ujb/KDPWM+\nMQaAKKdKve535UldqCvZrSkmF0sdyJz4gD5vmqKgLi7SoAuMGAoO18i2pNFLOGhd\n5Ibuw3gpAgMBAAECggEAC5pfn7z9tCmihN4jkBtrE/8Dh0kmKiKyYyepJW7VpwhI\n9tXnjnI6TrrnVGN06HQ+dzwLwJFmeQkuxidttQLd27G5qrss3rBcY3U4ndg81iP5\nN7L9zUYiGy0dwDmD2O3WIIQLvTXO2/3hccIu8tCwncglEAjKF9i7PmXtD0UP//mk\nla6+Jd6EkWzIL1jx4weTnldyu2Jta2oJD/bgMEclEJbyJgHQVFYjT00QTOoCvr7H\nf+NP4PexUwNcLNlYKDvSkw2YIRxSC6gIgAPTd9QNimq5ed2bUczJ+ZTY+IQnr/Fg\n6651Nx6LxEFfcAa/033Fr87GsXYi+nN64Bg6/9JJuQKBgQD+XOoErITRvBz3UoAZ\njztVwnwW9rNE3KrYPdXhlVAQovX6+qU23HaLMq+JLYMqwUeNbAuCynHf8OojewVb\nz4AIutvJtlsq3oz1o7tptbYFL+ZrT8gk2s1ffAj6MoHnW379LRfz4GfilBdDPtPe\nQmYB/9HbGBJReGFhxpiKfUex+wKBgQD4SKw2cx63MZRGqSfdxmUrseQlKWC0vnel\n7/e6PD77fA28PpDHO/ovIAqM7Czyn1256gQqcIddFYCP1+RqyWjeHfiaLDMP4ZF2\n/kvoj98+Eo034cf//+IuTFqSpaTD0CbRl6wPaCWvCcx1TqpJMQQ6WUAwOZsLcrPi\n84oJLGhJKwKBgQDGyLQ2fOC7zChS/I2R7Abx6bDyfU/yZAW8Qu7wgbD1n3Ve9BzD\nuB2IgU7/hKr6cdxKYILKbw35dhx1KAIzEwG7UNTNWg77fLtqiM/BODoM6bdIbCw8\n6SYRFi0p4uj0duPSVjhe5iQpxZQ8gFAxZXC05UkK0VAXjV2FfR/fMzMhmwKBgFD6\nauirbWY0jnbpbu4/afnxYEbakwcAZEfD15lvUt91G4m9Ij1JC5VZLve9g/9yCQC9\nGbS51PyAKdlAgehuXnyra8zlA5Z3bJlR4XItkpNNO6/xPOj7DUsqbhQMYIvZFQAh\nJuYzgq7vVDcifBm5Gfbp6yyPbUkzlQY9hlTtnenXAoGBAJKRiEhBJthxO2so/vX5\nka57AZWKLJNVXaYbKuHq0FKsT87AFGTnHnNhuPjFFNDWsZnVgIOxQgHL5DFqtXqw\n49NKahAxehvmlJhWwcrKO1hoTHxMyLCQYlDinTcPQzUyT31TChOkr7dvywfIjHL2\nX5NsAyU04fXUEOWDEp+1nd60\n-----END PRIVATE KEY-----\n",
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};

initializeApp({
  credential: _credential.cert(serviceAccount),
});
console.log("Firebase Admin SDK initialized.");

export async function createUserWithPhoneNumber(phoneNumber) {
  try {
    const userRecord = await auth().createUser({
      phoneNumber: phoneNumber,
      // Optional: add other user properties like displayName, photoURL, etc.
    });
    console.log("Successfully created new user:", userRecord.uid);
    return userRecord;
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}

// Example usage:
createUserWithPhoneNumber("+919876543210");
