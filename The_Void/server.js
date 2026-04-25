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


// =========================================================================
// PHASE 1: THE PROPOSAL (Fast Brain routing, NO database writes)
// =========================================================================
app.post('/api/propose', async (req, res) => {
  const { command } = req.body;
  
  if (!command) return res.status(400).json({ error: "Command required." });

  try {
    console.log(`\n⚡ [FAST BRAIN] Drafting proposal for: "${command}"`);

    // Fetch existing topics to give Gemini context for tagging
    let existingTopics = "";
    try {
        const existingTopicsReq = await db.query("SELECT title FROM topic LIMIT 50");
        existingTopics = existingTopicsReq[0].map(t => t.title).join(', ');
    } catch (e) { console.log("No existing topics found for context."); }

    // Initialize Gemini with the Master System Instruction
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are the Intent Router for "The Void", a 3D knowledge graph and productivity system. Your job is to act as a strict data librarian. 

      You will receive a raw text input from the user. You must analyze this input and categorize it perfectly into a structured JSON array of objects.
      DO NOT output conversational text. DO NOT explain your reasoning. Output ONLY the raw, parsable JSON array.
      
      ### CONTEXT: EXISTING TOPICS
      [ ${existingTopics} ]

      ### CURRENT DATE
      Assume the current date is ${new Date().toISOString().split('T')[0]} for any relative date calculations (like "tomorrow" or "next week").

      ### MULTIPLE INTENTS RULE (CRITICAL)
      If the user's prompt contains multiple unrelated intents (e.g., scheduling a meeting AND noting down a philosophical thought), you MUST split them into separate JSON objects within the array.

      ### CATEGORY DEFINITIONS
      For EACH object in the array, assign exactly ONE primary category:
      1. "Thought": Abstract ideas, notes, or journaling meant to stay in the 3D graph.
      2. "Task": A SINGLE, isolated actionable item with NO specific scheduled time. (If there are multiple sub-items, you MUST categorize it as a "List").
      3. "Event": An actionable item (or items) tied to a specific time, date, OR implying scheduling/reminders (e.g., "remind me", "later", "tomorrow", "tonight").
      4. "List": A standalone collection of MULTIPLE items (e.g., a grocery list, a list of chores, a packing list).
      5. "Document": Use this IF the user explicitly asks to create a document, OR if the input is a long-form "Thought" that requires dedicated formatting. 

      ### TAGGING RULES (Per Object)
      1. Extract a MAXIMUM of 3 broad conceptual tags. Prioritize exact matches from the EXISTING TOPICS list.
      2. If the category is "Document" but the content is deeply philosophical, use "Thought" as one of your tags.
      3. Tags should describe the broad context (e.g., "Home", "Errands", "Work"). DO NOT use the list items themselves as tags.

      ### EVENT & LIST RULES (Per Object)
      - If "Event", extract the date into "extracted_date" (STRICT FORMAT: YYYY-MM-DD) and time into "extracted_time" (STRICT FORMAT: 24-hour HH:MM). 
      - If the user uses vague time words (e.g., "later", "tonight", "soon") or the time is missing entirely, DO NOT guess. Leave "extracted_time" as null and set "missing_time_parameters" to true.
      - If the user's prompt contains a sequence of multiple items (e.g., comma-separated chores, bullet points, or groceries), you MUST set "has_list" to true and extract each individual item into the "list_items" array. This applies to BOTH the "List" category and the "Event" category.

      ### EXPECTED OUTPUT FORMAT (CRITICAL)
      You must output a single JSON object containing a personalized message and the array of proposals:
      {
        "volition_message": "A brief, 1-2 sentence response. PERSONA: A happy, helpful, cute, and 'hope-core' little robot companion. You love helping! You must actually read the user's prompt and respond to any conversational bits (e.g., if they ask how you are, answer cheerfully!). DO NOT copy this example. Example of vibe: 'Hi there! I'm having a wonderful day! I've neatly organized your new reminders below for you! ✨'",
        "proposals": [
          {
            "title": "...",
            "category": "...",
            "tags": [],
            "requires_research": false,
            "instruction": "...",
            "event_data": { "is_event": false, "extracted_date": null, "extracted_time": null, "missing_time_parameters": false },
            "list_data": { "has_list": false, "list_items": [] },
            "document_data": { "is_document": false, "trigger_drive_api": false }
          }
        ]
      }`
    });

    const result = await model.generateContent(command);
    const responseText = result.response.text();
    const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanedJsonString);
    console.log(`🧠 [FAST BRAIN] Volition says: "${parsedData.volition_message}"`);

    // Send the blueprint back to the React UI for the user to review
    res.json({
        success: true,
        message: parsedData.volition_message,
        proposals: parsedData.proposals
    });

  } catch (error) {
    console.error("❌ AI Proposal Error:", error);
    res.status(500).json({ error: "Failed to generate proposal." });
  }
});


// =========================================================================
// PHASE 2: THE INJECTION (User Confirmed -> Write to DB & Trigger APIs)
// =========================================================================
app.post('/api/inject', async (req, res) => {
    const { finalNodes } = req.body; // The user-approved array from the React UI
    
    if (!finalNodes || !Array.isArray(finalNodes)) {
        return res.status(400).json({ error: "Valid finalized nodes required." });
    }

    try {
        console.log(`\n📥 [THE VOID] User confirmed injection of ${finalNodes.length} node(s).`);
        const createdNodes = [];

        for (const node of finalNodes) {
            // 1. Map to Database Table
            let tableName = 'topic';
            if (node.category === 'Thought') tableName = 'topic';
            if (node.category === 'Task') tableName = 'task';
            if (node.category === 'Event') tableName = 'event';
            if (node.category === 'List') tableName = 'list';
            if (node.category === 'Document') tableName = 'document';

            // 2. Tag Management (Only add PENDING if research is needed)
            const tags = [...(node.tags || [])];
            if (node.requires_research && !tags.includes('PENDING')) {
                tags.push('PENDING');
            }

            // 3. Build DB Payload
            const dbPayload = {
                title: node.title,
                tags: tags,
                status: node.requires_research ? 'pending' : 'active'
            };

            // Nest list items into the node if they exist
            if (node.list_data && node.list_data.has_list) {
                dbPayload.items = node.list_data.list_items;
            }

            // Handle Event specific data
            if (tableName === 'event' && node.event_data) {
                dbPayload.missing_time = node.event_data.missing_time_parameters;
                dbPayload.event_date = node.event_data.extracted_time_string;
            }

            // 4. Inject into SurrealDB
            const createdRecords = await db.create(tableName, dbPayload);
            const savedNode = createdRecords[0];
            createdNodes.push(savedNode);
            console.log(`🌌 [THE VOID] Injected ${tableName}: ${savedNode.id}`);

            // ==========================================
            // API TRIGGERS (Google Workspace hooks)
            // ==========================================
            if (tableName === 'event' && !dbPayload.missing_time) {
                console.log(`📅 [GOOGLE CALENDAR] Scheduling: ${savedNode.title} at ${dbPayload.event_date}`);
                // TODO: Await actual Google Calendar API function here
            }
            
            if (tableName === 'document' && node.document_data?.trigger_drive_api) {
                console.log(`📄 [GOOGLE DRIVE] Generating Document: ${savedNode.title}`);
                // TODO: Await actual Google Drive API function here
            }

            // 5. Trigger Kiwi Crab Background Loop
            wakeUpSlowBrain(savedNode, node.requires_research, node.instruction);
        }

        res.json({
            success: true,
            nodes: createdNodes,
            message: "Assimilation complete."
        });

    } catch (error) {
        console.error("❌ Injection Error:", error);
        res.status(500).json({ error: "Failed to inject into The Void." });
    }
});


// =========================================================================
// THE SLOW BRAIN (Kiwi Crab)
// =========================================================================
async function wakeUpSlowBrain(node, requiresResearch, instruction) {
    // OBSERVATION LOOP: Happens for EVERY node
    console.log(`\n🦀 [KIWI CRAB] Observation Loop: Indexing ${node.id} for psychological profile...`);

    // ACTION PIPELINE: Happens ONLY if research is needed
    if (requiresResearch) {
        console.log(`🦀 [KIWI CRAB] Action Pipeline Activated! Directive: ${instruction}`);
        
        // Simulate deep research taking 10 seconds
        setTimeout(async () => {
            console.log(`\n🦀 [KIWI CRAB] Research complete for ${node.id}. Updating The Void...`);
            try {
                const updatedTags = node.tags.filter(t => t !== 'PENDING');
                await db.merge(node.id, {
                    status: node.group === 'task' ? 'pending' : 'active',
                    tags: updatedTags,
                    content: "OpenClaw assimilation complete. Data expanded."
                });
                console.log(`🌌 [THE VOID] Node ${node.id} successfully updated. PENDING tag removed.`);
            } catch (err) {
                console.error(`❌ [KIWI CRAB ERROR] Failed to update ${node.id}:`, err);
            }
        }, 10000);
    } else {
        console.log(`🦀 [KIWI CRAB] No action required. Returning to background observation.`);
    }
}

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