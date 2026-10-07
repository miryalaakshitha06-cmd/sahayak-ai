const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const OLLAMA_URL = "http://localhost:11434/api/generate";

// ======================================================
// INCIDENT STORAGE
// ======================================================

const INCIDENTS_FILE = path.join(__dirname, "incidents.json");

function readIncidents() {
  try {
    if (!fs.existsSync(INCIDENTS_FILE)) {
      fs.writeFileSync(INCIDENTS_FILE, "[]");
    }

    const data = fs.readFileSync(INCIDENTS_FILE, "utf8");

    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("âŒ Error reading incidents:", error);
    return [];
  }
}

function saveIncidents(incidents) {
  try {
    fs.writeFileSync(
      INCIDENTS_FILE,
      JSON.stringify(incidents, null, 2)
    );

    return true;
  } catch (error) {
    console.error("âŒ Error saving incidents:", error);
    return false;
  }
}

// ======================================================
// HOME / HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "Sahayak AI Backend",
    ai: "Qwen 2.5 3B Local AI",
    persistence: "Enabled"
  });
});

// ======================================================
// AI EMERGENCY ANALYSIS
// ======================================================

app.post("/api/analyze", async (req, res) => {
  try {
    const { emergencyText, language } = req.body;

    if (!emergencyText || !emergencyText.trim()) {
      return res.status(400).json({
        error: "Emergency description is required."
      });
    }

    const selectedLanguage = language || "English";

    let languageInstruction = "";

    if (selectedLanguage === "à°¤à±†à°²à±à°—à±") {
      languageInstruction = `
Respond completely in Telugu.
Use clear, simple Telugu that an ordinary person
can understand during an emergency.
Keep important emergency terms understandable.
`;
    } else if (selectedLanguage === "à¤¹à¤¿à¤‚à¤¦à¥€") {
      languageInstruction = `
Respond completely in Hindi.
Use clear, simple Hindi that an ordinary person
can understand during an emergency.
Keep important emergency terms understandable.
`;
    } else {
      languageInstruction = `
Respond completely in English.
Use clear, simple English that an ordinary person
can understand during an emergency.
`;
    }

    const prompt = `
You are Sahayak AI, an intelligent multilingual
emergency first-response assistant designed for India.

${languageInstruction}

Analyze the emergency description provided by the user.

Your job is to:

1. Identify the likely emergency type.
2. Estimate the severity.
3. Identify conditions explicitly mentioned by the user.
4. Give short, safety-focused immediate guidance.
5. Encourage contacting appropriate emergency services
   for serious or life-threatening situations.

IMPORTANT SAFETY RULES:

- You are NOT a doctor.
- Do NOT claim to replace doctors, ambulances,
  or emergency services.
- Do NOT invent symptoms or facts that the user
  did not provide.
- Do not give unnecessarily complicated instructions.
- Prioritize immediate safety.
- For serious emergencies, advise contacting
  India's emergency number 112.
- Keep guidance clear enough for a stressed
  bystander to understand.
- Do not provide dangerous or experimental
  medical instructions.
- If the situation appears immediately life-threatening,
  clearly recommend contacting emergency services.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside the JSON.

Use exactly this structure:

{
  "emergencyType": "string",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "conditions": ["string"],
  "actions": ["string"]
}

Emergency description:

${emergencyText}
`;

    console.log(`ðŸŒ Language selected: ${selectedLanguage}`);
    console.log(`ðŸš¨ Emergency received: ${emergencyText}`);

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,
        format: "json"
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();

      console.error("OLLAMA ERROR:", errorText);

      return res.status(500).json({
        error: "Unable to connect to local AI."
      });
    }

    const ollamaData = await ollamaResponse.json();

    let result;

    try {
      result = JSON.parse(ollamaData.response);
    } catch (parseError) {
      console.error(
        "JSON PARSE ERROR:",
        ollamaData.response
      );

      return res.status(500).json({
        error: "AI returned an invalid response."
      });
    }

    if (
      !result.emergencyType ||
      !result.severity ||
      !Array.isArray(result.conditions) ||
      !Array.isArray(result.actions)
    ) {
      return res.status(500).json({
        error: "AI returned an incomplete emergency analysis."
      });
    }

    console.log("âœ… AI analysis completed successfully.");

    res.json(result);

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Unable to analyze the emergency.",
      details: error.message
    });
  }
});

// ======================================================
// GET ALL INCIDENTS
// ======================================================

app.get("/api/incidents", (req, res) => {
  try {
    const incidents = readIncidents();

    incidents.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    res.json({
      success: true,
      incidents,
      count: incidents.length
    });

  } catch (error) {
    console.error("GET INCIDENTS ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Unable to load incidents."
    });
  }
});

// ======================================================
// CREATE NEW INCIDENT
// ======================================================

app.post("/api/incidents", (req, res) => {
  try {
    const {
      type,
      emergencyType,
      severity,
      description,
      conditions,
      actions,
      latitude,
      longitude,
      location,
      language,
      status
    } = req.body;

    if (!type && !emergencyType) {
      return res.status(400).json({
        success: false,
        error: "Emergency type is required."
      });
    }

    if (!severity) {
      return res.status(400).json({
        success: false,
        error: "Severity is required."
      });
    }

    const incidents = readIncidents();

    const incidentNumber =
      incidents.length + 1001;

    const newIncident = {
      id: `SH-${incidentNumber}`,

      type: type || emergencyType,

      emergencyType:
        emergencyType || type,

      severity: severity,

      description:
        description ||
        "Emergency reported through Sahayak AI.",

      conditions:
        Array.isArray(conditions)
          ? conditions
          : [],

      actions:
        Array.isArray(actions)
          ? actions
          : [],

      latitude:
        latitude !== undefined
          ? latitude
          : null,

      longitude:
        longitude !== undefined
          ? longitude
          : null,

      location:
        location || null,

      language:
        language || "English",

      status:
        status || "NEW",

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };

    incidents.push(newIncident);

    const saved = saveIncidents(incidents);

    if (!saved) {
      return res.status(500).json({
        success: false,
        error: "Unable to save incident."
      });
    }

    console.log(
      `ðŸš¨ New incident created: ${newIncident.id}`
    );

    res.status(201).json({
      success: true,
      message: "Incident created successfully.",
      incident: newIncident
    });

  } catch (error) {
    console.error(
      "CREATE INCIDENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Unable to create incident."
    });
  }
});

// ======================================================
// UPDATE INCIDENT STATUS
// ======================================================

app.patch("/api/incidents/:id", (req, res) => {
  try {
    const incidentId = req.params.id;

    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "ACKNOWLEDGED",
      "DISPATCHED",
      "RESOLVED"
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid incident status.",
        allowedStatuses
      });
    }

    const incidents = readIncidents();

    const incidentIndex =
      incidents.findIndex(
        (incident) =>
          incident.id === incidentId
      );

    if (incidentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Incident not found."
      });
    }

    incidents[incidentIndex].status = status;

    incidents[incidentIndex].updatedAt =
      new Date().toISOString();

    const saved = saveIncidents(incidents);

    if (!saved) {
      return res.status(500).json({
        success: false,
        error: "Unable to update incident."
      });
    }

    console.log(
      `ðŸ”„ Incident ${incidentId} updated to ${status}`
    );

    res.json({
      success: true,
      message: "Incident updated successfully.",
      incident: incidents[incidentIndex]
    });

  } catch (error) {
    console.error(
      "UPDATE INCIDENT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Unable to update incident."
    });
  }
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log("");
  console.log(
    `ðŸš‘ Sahayak AI Backend running on http://localhost:${PORT}`
  );
  console.log("ðŸ¤– Local AI: Qwen 2.5 3B");
  console.log("ðŸŒ Multilingual: English + Telugu + Hindi");
  console.log("ðŸ’¾ Incident Persistence: Enabled");
  console.log("");
});
