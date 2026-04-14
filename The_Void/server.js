require('dotenv').config();
globalThis.WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { Surreal } = require('surrealdb'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5174' })); 
app.use(express.json());

// === SURREALDB CONNECTION LOGIC ===
const db = new Surreal();

async function connectDb() {
    try {
        // FIX: Changed http:// to ws:// to force a persistent WebSocket connection!
        await db.connect('ws://127.0.0.1:8000/rpc');
        await db.use({ namespace: 'neurograph', database: 'zettelkasten' }); 
        console.log("✅ Connected to SurrealDB");
    } catch (err) {
        console.error("❌ Failed to connect to SurrealDB:", err);
    }
}
connectDb();
// ==========================================

// Initialize the Google OAuth Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

// Define the scopes (permissions)
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events', 
  'https://www.googleapis.com/auth/documents',       
  'https://www.googleapis.com/auth/drive.readonly'   
];

// ==========================================
// ROUTES
// ==========================================

// Route 1: The Login Button Endpoint
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', 
    scope: SCOPES,
    prompt: 'consent' 
  });
  res.redirect(url);
});

// Route 2: The Callback Endpoint
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code; 
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n🎉 SUCCESS! Here are your tokens:');
    console.log('-----------------------------------');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token); 
    console.log('-----------------------------------\n');

    res.send('<h1>Authentication Successful!</h1><p>Check your terminal for the Refresh Token. You can close this window.</p>');

  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

// Route 3: The Command HUD Endpoint
app.post('/api/command', async (req, res) => {
  const userPrompt = req.body.prompt;

  if (!userPrompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `You are the Intent Router for "The Void", a 3D knowledge graph and productivity system. Your job is to act as a strict data librarian. 

      You will receive a raw text input from the user. You must analyze this input and categorize it perfectly into a structured JSON array of objects.
      DO NOT output conversational text. DO NOT explain your reasoning. Output ONLY the raw, parsable JSON array.
      
      ### CONTEXT: EXISTING TOPICS
      [ {{INSERT_EXISTING_TOPICS_HERE}} ]

      ### MULTIPLE INTENTS RULE (CRITICAL)
      If the user's prompt contains multiple unrelated intents (e.g., scheduling a meeting AND noting down a philosophical thought), you MUST split them into separate JSON objects within the array.

      ### CATEGORY DEFINITIONS
      For EACH object in the array, assign exactly ONE primary category:
      1. "Thought": Abstract ideas, notes, or journaling meant to stay in the 3D graph.
      2. "Task": An actionable item with NO specific scheduled time.
      3. "Event": An actionable item that mentions a specific day, date, or time.
      4. "List": A standalone collection of items.
      5. "Document": Use this IF the user explicitly asks to create a document, OR if the input is a long-form "Thought" that requires dedicated formatting. 

      ### TAGGING RULES (Per Object)
      1. Extract a MAXIMUM of 3 broad conceptual tags. Prioritize exact matches from the EXISTING TOPICS list.
      2. If the category is "Document" but the content is deeply philosophical, use "Thought" as one of your tags.

      ### EVENT & LIST RULES (Per Object)
      - If "Event", check for specific time data. If missing (e.g., just "Sunday"), flag "missing_time_parameters" as true.
      - If an object contains a sequence of items, flag "has_list" as true and extract them into the "list_items" array.

      ### EXPECTED OUTPUT FORMAT
      [
        {
          "title": "...",
          "category": "...",
          "tags": [],
          "event_data": { "is_event": false, "extracted_time_string": null, "missing_time_parameters": false },
          "list_data": { "has_list": false, "list_items": [] },
          "document_data": { "is_document": false, "trigger_drive_api": false }
        }
      ]`
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    
    const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJsonString);

    res.json(parsedData);

  } catch (error) {
    console.error("AI Routing Error:", error);
    res.status(500).json({ error: "Failed to process command." });
  }
});

// Route 4: Search the Void (Memory Retrieval)
app.get('/api/search', async (req, res) => {
  const searchTerm = req.query.q;
  
  if (!searchTerm) {
    return res.json([]);
  }

  try {
    // Query SurrealDB for any node containing the search term (case-insensitive)
    const result = await db.query(
      `SELECT id, name, group FROM topic, task, document 
       WHERE string::lowercase(name) CONTAINS string::lowercase($searchTerm)
       LIMIT 15`, 
      { searchTerm }
    );
    
    // SurrealDB returns an array of result sets. We send back the first set.
    res.json(result[0] || []);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Failed to query the void." });
  }
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Void Backend is running on http://localhost:${PORT}`);
});

// === SAFETY NETS ===
// These will catch silent crashes and print them to the terminal instead of just dying.
process.on('uncaughtException', (err) => console.error('🔥 CRITICAL ERROR:', err));
process.on('unhandledRejection', (reason) => console.error('🔥 UNHANDLED PROMISE:', reason));