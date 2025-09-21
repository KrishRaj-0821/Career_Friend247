exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { prompt, systemInstruction, useSearch = false } = JSON.parse(event.body);
    
    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid prompt' })
      };
    }
    
    if (!systemInstruction || typeof systemInstruction !== 'string' || systemInstruction.length > 2000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid system instruction' })
      };
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Service temporarily unavailable' })
      };
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { 
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    };
    
    if (useSearch) {
      payload.tools = [{ "google_search": {} }];
    }

    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'CareerFriend/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'AI service temporarily unavailable' })
      };
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('No text found in Gemini API response:', result);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Invalid response from AI service' })
      };
    }

    try {
      const parsedResponse = JSON.parse(text);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(parsedResponse)
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Invalid response format from AI service' })
      };
    }

  } catch (error) {
    console.error('Gemini API proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
