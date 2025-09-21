exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const firebaseConfig = {
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "career-friend-b0a6e.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "career-friend-b0a6e",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "career-friend-b0a6e.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "207827097970",
    appId: process.env.FIREBASE_APP_ID || "1:207827097970:web:a1f18a2679aa04c8e2a5eb",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-X47ZLMJ4X5"
  };

  // Only include API key if it's set
  if (process.env.FIREBASE_API_KEY) {
    firebaseConfig.apiKey = process.env.FIREBASE_API_KEY;
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(firebaseConfig)
  };
};
