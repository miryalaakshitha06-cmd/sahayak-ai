import { useEffect, useMemo, useRef, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle,
  Clock,
  Globe,
  HeartPulse,
  MapPin,
  Mic,
  Phone,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserRound,
  Users,
} from "lucide-react";

import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  // =====================================================
  // MAIN APP STATE
  // =====================================================

  const [showEmergency, setShowEmergency] = useState(false);
  const [showResponderDashboard, setShowResponderDashboard] =
    useState(false);

  const [language, setLanguage] = useState("English");
  const [showLanguages, setShowLanguages] = useState(false);

  const [emergencyText, setEmergencyText] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // VOICE
  // =====================================================

  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  const recognitionRef = useRef(null);

  // =====================================================
  // LOCATION
  // =====================================================

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [locationError, setLocationError] = useState("");

  // =====================================================
  // INCIDENTS
  // =====================================================

  const [incidents, setIncidents] = useState([]);

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [incidentFilter, setIncidentFilter] =
    useState("ALL");

  const [loadingIncidents, setLoadingIncidents] =
    useState(false);

  const [incidentError, setIncidentError] = useState("");

  const [savingIncident, setSavingIncident] =
    useState(false);

  // =====================================================
  // LOAD INCIDENTS FROM BACKEND
  // =====================================================

  const loadIncidents = async () => {
    try {
      setLoadingIncidents(true);
      setIncidentError("");

      const response = await fetch(
        `${API_URL}/incidents`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load incidents."
        );
      }

      setIncidents(data.incidents || []);
    } catch (error) {
      console.error(
        "LOAD INCIDENTS ERROR:",
        error
      );

      setIncidentError(
        "Unable to load incidents from backend."
      );
    } finally {
      setLoadingIncidents(false);
    }
  };

  // Load incidents when app starts
  useEffect(() => {
    loadIncidents();
  }, []);

  // =====================================================
  // =====================================================
  // VOICE SETUP
  // =====================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("VOICE ERROR:", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setEmergencyText((previous) =>
        previous
          ? `${previous} ${transcript}`
          : transcript
      );

      setAnalysis(null);
      setError("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.log("Voice cleanup:", error);
      }
    };
  }, []);

  // =====================================================
  // START / STOP VOICE
  // =====================================================

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert(
        "Voice input is not supported in this browser."
      );
      return;
    }

    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    // Map the selected Sahayak AI language
    // to the browser speech-recognition language.
    const speechLanguageMap = {
      English: "en-IN",
      "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41": "te-IN",
      "\u0939\u093F\u0902\u0926\u0940": "hi-IN",
    };

    const selectedSpeechLanguage =
      speechLanguageMap[language] || "en-IN";

    recognitionRef.current.lang =
      selectedSpeechLanguage;

    console.log(
      "Speech recognition language:",
      selectedSpeechLanguage
    );

try {
      recognitionRef.current.start();
    } catch (error) {
      console.error(
        "VOICE START ERROR:",
        error
      );
    }
  };

  // LOCATION
  // =====================================================

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(newLocation);
        setLocationLoading(false);
      },
      (error) => {
        console.error(
          "LOCATION ERROR:",
          error
        );

        setLocationLoading(false);

        setLocationError(
          "Location permission was not provided."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // GOOGLE MAPS
  // =====================================================

  const getMapLink = (incident) => {
    if (
      incident.latitude === null ||
      incident.longitude === null ||
      incident.latitude === undefined ||
      incident.longitude === undefined
    ) {
      return null;
    }

    return `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
  };

  // =====================================================
  // AI ANALYSIS
  // =====================================================

  const handleAnalyze = async () => {
    if (!emergencyText.trim()) {
      alert(
        "Please describe the emergency first."
      );
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            emergencyText:
              emergencyText.trim(),

            language: language,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "AI analysis failed."
        );
      }

      setAnalysis(data);

      // Automatically request location
      // after successful analysis.
      if (!location) {
        getLocation();
      }
    } catch (error) {
      console.error(
        "AI ANALYSIS ERROR:",
        error
      );

      setError(
        "Unable to connect to Sahayak AI. Make sure the backend and Ollama are running."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // =====================================================
  // EXAMPLE
  // =====================================================

  const handleExample = (text) => {
    setEmergencyText(text);
    setAnalysis(null);
    setError("");
  };

  // =====================================================
  // CREATE INCIDENT
  // =====================================================

  const sendEmergencyToResponder = async () => {
    if (!analysis) {
      return;
    }

    try {
      setSavingIncident(true);
      setError("");

      const incidentData = {
        type: analysis.emergencyType,

        emergencyType:
          analysis.emergencyType,

        severity:
          analysis.severity,

        description:
          emergencyText.trim(),

        conditions:
          analysis.conditions || [],

        actions:
          analysis.actions || [],

        latitude:
          location?.latitude ?? null,

        longitude:
          location?.longitude ?? null,

        location:
          location
            ? `${location.latitude}, ${location.longitude}`
            : null,

        language:
          language,

        status: "NEW",
      };

      const response = await fetch(
        `${API_URL}/incidents`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            incidentData
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save emergency."
        );
      }

      // Add newly created incident
      // to the dashboard immediately.
      setIncidents((previous) => [
        data.incident,
        ...previous,
      ]);

      setSelectedIncident(
        data.incident
      );

      alert(
        `Emergency ${data.incident.id} has been sent to the responder dashboard.`
      );

      setShowResponderDashboard(true);
      setShowEmergency(false);
    } catch (error) {
      console.error(
        "SAVE INCIDENT ERROR:",
        error
      );

      setError(
        "Unable to send emergency to responder dashboard."
      );
    } finally {
      setSavingIncident(false);
    }
  };

  // =====================================================
  // UPDATE INCIDENT STATUS
  // =====================================================

  const updateIncidentStatus = async (
    incidentId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/incidents/${incidentId}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update incident."
        );
      }

      // Update frontend state
      setIncidents((previous) =>
        previous.map((incident) =>
          incident.id === incidentId
            ? data.incident
            : incident
        )
      );

      // Update selected incident
      if (
        selectedIncident?.id ===
        incidentId
      ) {
        setSelectedIncident(
          data.incident
        );
      }
    } catch (error) {
      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      alert(
        "Unable to update incident status."
      );
    }
  };

  // =====================================================
  // INCIDENT FILTER
  // =====================================================

  const filteredIncidents = useMemo(() => {
    if (incidentFilter === "ALL") {
      return incidents;
    }

    if (incidentFilter === "ACTIVE") {
      return incidents.filter(
        (incident) =>
          incident.status !==
            "RESOLVED"
      );
    }

    return incidents.filter(
      (incident) =>
        incident.severity ===
        incidentFilter
    );
  }, [
    incidents,
    incidentFilter,
  ]);

  // =====================================================
  // INCIDENT COUNTERS
  // =====================================================

  const totalIncidents =
    incidents.length;

  const activeIncidents =
    incidents.filter(
      (incident) =>
        incident.status !==
        "RESOLVED"
    ).length;

  const criticalIncidents =
    incidents.filter(
      (incident) =>
        incident.severity ===
        "CRITICAL"
    ).length;

  const highIncidents =
    incidents.filter(
      (incident) =>
        incident.severity ===
        "HIGH"
    ).length;

  // =====================================================
  // STATUS BUTTON
  // =====================================================

  const getNextStatus = (status) => {
    if (status === "NEW") {
      return "ACKNOWLEDGED";
    }

    if (status === "ACKNOWLEDGED") {
      return "DISPATCHED";
    }

    if (status === "DISPATCHED") {
      return "RESOLVED";
    }

    return null;
  };

  // =====================================================
  // EMERGENCY SCREEN
  // =====================================================

  if (showEmergency) {
    return (
      <div className="emergency-page">

        <nav className="navbar">

          <div className="brand">

            <div className="brand-icon">
              <HeartPulse size={24} />
            </div>

            <div>
              <h2>Sahayak AI</h2>

              <span>
                Emergency First-Response Assistant
              </span>
            </div>

          </div>

          <button
            className="back-btn"
            onClick={() => {
              setShowEmergency(false);
              setAnalysis(null);
              setError("");
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

        </nav>

        <main className="emergency-main">

          <div className="emergency-header">

            <div className="emergency-badge">
              <span></span>
              EMERGENCY ASSISTANCE
            </div>

            <h1>
              Tell Sahayak
              <span>
                {" "}what is happening.
              </span>
            </h1>

            <p>
              Describe the situation in your
              own words. Sahayak AI will analyze
              the information and provide
              safety-focused first-response
              guidance.
            </p>

          </div>

          {/* LANGUAGE */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "flex-end",
              marginBottom: "15px",
            }}
          >

            <div
              style={{
                position:
                  "relative",
              }}
            >

              <button
                className="language-btn"
                onClick={() =>
                  setShowLanguages(
                    !showLanguages
                  )
                }
              >
                <Globe size={18} />

                {language}
              </button>

              {showLanguages && (
                <div
                  style={{
                    position:
                      "absolute",
                    right: 0,
                    top:
                      "calc(100% + 8px)",
                    background:
                      "white",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius:
                      "12px",
                    padding:
                      "6px",
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,0.12)",
                    zIndex: 20,
                    minWidth:
                      "150px",
                  }}
                >

                  {[
                    "English",
                    "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
                    "\u0939\u093F\u0902\u0926\u0940",
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setLanguage(
                          item
                        );
                        setShowLanguages(
                          false
                        );
                      }}
                      style={{
                        width:
                          "100%",
                        border:
                          "none",
                        background:
                          language ===
                          item
                            ? "#f1f5f9"
                            : "transparent",
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                        cursor:
                          "pointer",
                        textAlign:
                          "left",
                      }}
                    >
                      {item}
                    </button>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* INPUT */}

          <div className="input-card">

            <div className="input-card-header">

              <div className="ai-small-icon">
                <Bot size={22} />
              </div>

              <div>
                <strong>
                  Emergency Description
                </strong>

                <span>
                  Describe what you can see
                  or hear
                </span>
              </div>

            </div>

            <textarea
              value={emergencyText}
              onChange={(e) => {
                setEmergencyText(
                  e.target.value
                );

                setAnalysis(null);
                setError("");
              }}
              placeholder="Example: There is a road accident. A person is unconscious and bleeding heavily..."
            />

            <div className="input-actions">

              <button
                className="voice-input-btn"
                onClick={toggleVoice}
              >

                <Mic size={20} />

                {isListening
                  ? "Listening..."
                  : "Speak"}

              </button>

              <span className="input-hint">
                {voiceSupported
                  ? "You can type or speak naturally."
                  : "Voice input is not supported in this browser."}
              </span>

            </div>

            <button
              className="analyze-btn"
              onClick={
                handleAnalyze
              }
              disabled={
                isAnalyzing
              }
            >

              <Bot size={20} />

              {isAnalyzing
                ? "Analyzing with Sahayak AI..."
                : "Analyze Emergency"}

              {!isAnalyzing && (
                <ArrowRight
                  size={20}
                />
              )}

            </button>

            {error && (
              <div
                style={{
                  marginTop:
                    "16px",
                  padding:
                    "14px",
                  borderRadius:
                    "12px",
                  background:
                    "#fff1f2",
                  color:
                    "#b91c1c",
                  border:
                    "1px solid #fecdd3",
                }}
              >
                <strong>
                  Error
                </strong>

                <p
                  style={{
                    marginTop:
                      "5px",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

          </div>

          {/* LOCATION */}

          <div
            style={{
              marginTop:
                "15px",
              padding:
                "15px",
              borderRadius:
                "12px",
              background:
                "#f8fafc",
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "10px",
            }}
          >

            <MapPin size={20} />

            <div
              style={{
                flex: 1,
              }}
            >

              <strong>
                Emergency Location
              </strong>

              <div
                style={{
                  fontSize:
                    "13px",
                  marginTop:
                    "3px",
                }}
              >

                {location
                  ? `${location.latitude.toFixed(
                      6
                    )}, ${location.longitude.toFixed(
                      6
                    )}`
                  : "Location not added"}

              </div>

            </div>

            <button
              onClick={getLocation}
              disabled={
                locationLoading
              }
              style={{
                padding:
                  "9px 14px",
                border:
                  "none",
                borderRadius:
                  "8px",
                cursor:
                  "pointer",
              }}
            >
              {locationLoading
                ? "Getting..."
                : "Add Location"}
            </button>

          </div>

          {locationError && (
            <p
              style={{
                color:
                  "#b91c1c",
                fontSize:
                  "13px",
              }}
            >
              {locationError}
            </p>
          )}

          {/* AI ANALYSIS */}

          {analysis && (
            <div className="analysis-card">

              <div className="analysis-header">

                <div className="analysis-ai-icon">
                  <Bot size={24} />
                </div>

                <div>
                  <span>
                    SAHAYAK AI ANALYSIS
                  </span>

                  <h2>
                    Emergency Assessment
                  </h2>
                </div>

                <div
                  className={`severity-badge ${String(
                    analysis.severity
                  ).toLowerCase()}`}
                >
                  {analysis.severity}
                </div>

              </div>

              <div className="analysis-type">

                <span>
                  EMERGENCY TYPE
                </span>

                <h3>
                  {analysis.emergencyType}
                </h3>

              </div>

              <div className="analysis-section">

                <h3>
                  Detected Conditions
                </h3>

                <div className="condition-list">

                  {analysis.conditions?.map(
                    (
                      condition,
                      index
                    ) => (
                      <div
                        className="condition-item"
                        key={index}
                      >
                        <AlertTriangle
                          size={17}
                        />

                        {condition}
                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="analysis-section">

                <h3>
                  Immediate Safety Guidance
                </h3>

                <div className="action-list">

                  {analysis.actions?.map(
                    (
                      action,
                      index
                    ) => (
                      <div
                        className="action-item"
                        key={index}
                      >

                        <div className="action-number">
                          {index + 1}
                        </div>

                        <p>
                          {action}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

              <button
                className="report-btn"
                onClick={() => {
                  const report = `
SAHAYAK AI EMERGENCY REPORT

Emergency Type:
${analysis.emergencyType}

Severity:
${analysis.severity}

Description:
${emergencyText}

Detected Conditions:
${analysis.conditions
  ?.map(
    (item, index) =>
      `${index + 1}. ${item}`
  )
  .join("\n")}

Immediate Actions:
${analysis.actions
  ?.map(
    (item, index) =>
      `${index + 1}. ${item}`
  )
  .join("\n")}

Location:
${
  location
    ? `${location.latitude}, ${location.longitude}`
    : "Not provided"
}

Language:
${language}

Generated by Sahayak AI.
`;

                  const blob =
                    new Blob(
                      [report],
                      {
                        type:
                          "text/plain",
                      }
                    );

                  const url =
                    URL.createObjectURL(
                      blob
                    );

                  const link =
                    document.createElement(
                      "a"
                    );

                  link.href = url;

                  link.download =
                    "Sahayak-Emergency-Report.txt";

                  link.click();

                  URL.revokeObjectURL(
                    url
                  );
                }}
              >
                Generate Emergency Report
              </button>

              <button
                className="report-btn"
                style={{
                  marginTop:
                    "10px",
                }}
                onClick={
                  sendEmergencyToResponder
                }
                disabled={
                  savingIncident
                }
              >
                <Radio size={18} />

                {savingIncident
                  ? "Sending to Responder..."
                  : "Send Emergency to Responder"
                }
              </button>
              {analysis.severity ===
                "HIGH" ||
                analysis.severity ===
                  "CRITICAL" ? (
                <div
                  style={{
                    marginTop:
                      "15px",
                    padding:
                      "15px",
                    background:
                      "#fff1f2",
                    border:
                      "1px solid #fecdd3",
                    borderRadius:
                      "12px",
                    color:
                      "#991b1b",
                  }}
                >
                  <strong>
                    Serious Emergency
                  </strong>

                  <p
                    style={{
                      marginTop:
                        "5px",
                    }}
                  >
                    If this is an
                    immediate
                    life-threatening
                    emergency, contact
                    India's emergency
                    number <strong>112</strong>.
                  </p>
                </div>
              ) : null}

            </div>
          )}

          {/* EXAMPLES */}

          <div className="examples-section">

            <h3>
              Not sure what to say?
            </h3>

            <p>
              Choose an example to
              test Sahayak AI.
            </p>

            <div className="example-grid">

              <button
                onClick={() =>
                  handleExample(
                    "There is a road accident. A person is unconscious and bleeding heavily."
                  )
                }
              >
                🚗 Road accident
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "A person is unconscious and not responding."
                  )
                }
              >
                👤 Unconscious person
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "Someone has severe bleeding from an injury."
                  )
                }
              >
                🩸 Severe bleeding
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "There is a fire in a building and people may be trapped inside."
                  )
                }
              >
                🔥 Fire emergency
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "Someone is having difficulty breathing."
                  )
                }
              >
                🫁 Breathing difficulty
              </button>

              <button
                onClick={() =>
                  handleExample(
                    "A person has suffered a burn injury."
                  )
                }
              >
                🔥 Burn injury
              </button>

            </div>

          </div>

          <div className="emergency-notice">

            <AlertTriangle size={22} />

            <div>

              <strong>
                Emergency safety notice
              </strong>

              <p>
                Sahayak AI provides
                general first-response
                guidance and does not
                replace professional
                medical or emergency
                services.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // RESPONDER DASHBOARD
  // =====================================================

  if (showResponderDashboard) {
    return (
      <div className="app">

        <nav className="navbar">

          <div className="brand">

            <div className="brand-icon">
              <Radio size={24} />
            </div>

            <div>
              <h2>
                Responder Dashboard
              </h2>

              <span>
                Sahayak AI Emergency Coordination
              </span>
            </div>

          </div>

          <button
            className="back-btn"
            onClick={() => {
              setShowResponderDashboard(
                false
              );

              setSelectedIncident(
                null
              );
            }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

        </nav>

        <main
          style={{
            padding:
              "40px 5%",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              marginBottom:
                "30px",
            }}
          >

            <div
              className="status-pill"
            >
              <span className="status-dot"></span>

              RESPONDER OPERATIONS
            </div>

            <h1>
              Emergency
              <span>
                {" "}Response Dashboard
              </span>
            </h1>

            <p>
              Monitor emergency incidents
              received through Sahayak AI.
            </p>

          </div>

          {/* STATS */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap:
                "15px",
              marginBottom:
                "25px",
            }}
          >

            <div
              className="step-card"
            >
              <Users size={25} />

              <h3>
                Total Incidents
              </h3>

              <strong
                style={{
                  fontSize:
                    "30px",
                }}
              >
                {totalIncidents}
              </strong>
            </div>

            <div
              className="step-card"
            >
              <Clock size={25} />

              <h3>
                Active
              </h3>

              <strong
                style={{
                  fontSize:
                    "30px",
                }}
              >
                {activeIncidents}
              </strong>
            </div>

            <div
              className="step-card"
            >
              <ShieldAlert size={25} />

              <h3>
                Critical
              </h3>

              <strong
                style={{
                  fontSize:
                    "30px",
                }}
              >
                {criticalIncidents}
              </strong>
            </div>

            <div
              className="step-card"
            >
              <AlertTriangle size={25} />

              <h3>
                High
              </h3>

              <strong
                style={{
                  fontSize:
                    "30px",
                }}
              >
                {highIncidents}
              </strong>
            </div>

          </div>

          {/* FILTERS */}

          <div
            style={{
              display:
                "flex",
              gap:
                "10px",
              flexWrap:
                "wrap",
              marginBottom:
                "20px",
            }}
          >

            {[
              "ALL",
              "ACTIVE",
              "CRITICAL",
              "HIGH",
              "MEDIUM",
            ].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() =>
                    setIncidentFilter(
                      filter
                    )
                  }
                  style={{
                    padding:
                      "10px 18px",
                    borderRadius:
                      "20px",
                    border:
                      "1px solid #ddd",
                    cursor:
                      "pointer",
                    background:
                      incidentFilter ===
                      filter
                        ? "#111827"
                        : "white",
                    color:
                      incidentFilter ===
                      filter
                        ? "white"
                        : "#111827",
                  }}
                >
                  {filter}
                </button>
              )
            )}

            <button
              onClick={
                loadIncidents
              }
              style={{
                marginLeft:
                  "auto",
                padding:
                  "10px 18px",
                border:
                  "1px solid #ddd",
                borderRadius:
                  "20px",
                background:
                  "white",
                cursor:
                  "pointer",
              }}
            >
               Refresh
            </button>

          </div>

          {/* ERROR */}

          {incidentError && (
            <div
              style={{
                padding:
                  "15px",
                marginBottom:
                  "20px",
                background:
                  "#fff1f2",
                border:
                  "1px solid #fecdd3",
                borderRadius:
                  "12px",
                color:
                  "#991b1b",
              }}
            >
              {incidentError}
            </div>
          )}

          {/* LOADING */}

          {loadingIncidents && (
            <div
              style={{
                padding:
                  "20px",
              }}
            >
              Loading incidents...
            </div>
          )}

          {/* INCIDENT LIST */}

          {!loadingIncidents &&
            filteredIncidents.length ===
              0 && (
              <div
                className="step-card"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "50px",
                }}
              >

                <Radio
                  size={45}
                />

                <h2>
                  No incidents found
                </h2>

                <p>
                  Emergency reports
                  sent from Sahayak AI
                  will appear here.
                </p>

              </div>
            )}

          <div
            style={{
              display:
                "grid",
              gap:
                "15px",
            }}
          >

            {filteredIncidents.map(
              (incident) => {

                const mapLink =
                  getMapLink(
                    incident
                  );

                const nextStatus =
                  getNextStatus(
                    incident.status
                  );

                return (
                  <div
                    key={
                      incident.id
                    }
                    className="step-card"
                    style={{
                      textAlign:
                        "left",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        gap:
                          "15px",
                        flexWrap:
                          "wrap",
                      }}
                    >

                      <div>

                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "10px",
                            alignItems:
                              "center",
                          }}
                        >

                          <strong>
                            {
                              incident.id
                            }
                          </strong>

                          <span
                            className={`severity-badge ${String(
                              incident.severity
                            ).toLowerCase()}`}
                          >
                            {
                              incident.severity
                            }
                          </span>

                        </div>

                        <h2>
                          {
                            incident.emergencyType ||
                            incident.type
                          }
                        </h2>

                        <p>
                          {
                            incident.description
                          }
                        </p>

                      </div>

                      <div
                        style={{
                          textAlign:
                            "right",
                        }}
                      >

                        <strong>
                          {
                            incident.status
                          }
                        </strong>

                        <p>
                          {incident.createdAt
                            ? new Date(
                                incident.createdAt
                              ).toLocaleString()
                            : ""}
                        </p>

                      </div>

                    </div>

                    {/* CONDITIONS */}

                    {incident.conditions
                      ?.length >
                      0 && (
                      <div
                        style={{
                          marginTop:
                            "15px",
                        }}
                      >

                        <strong>
                          Conditions
                        </strong>

                        <ul>
                          {incident.conditions.map(
                            (
                              condition,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                              >
                                {
                                  condition
                                }
                              </li>
                            )
                          )}
                        </ul>

                      </div>
                    )}

                    {/* ACTIONS */}

                    {incident.actions
                      ?.length >
                      0 && (
                      <div>

                        <strong>
                          AI Guidance
                        </strong>

                        <ol>
                          {incident.actions.map(
                            (
                              action,
                              index
                            ) => (
                              <li
                                key={
                                  index
                                }
                              >
                                {
                                  action
                                }
                              </li>
                            )
                          )}
                        </ol>

                      </div>
                    )}

                    {/* LOCATION */}

                    {incident.latitude !==
                      null &&
                      incident.latitude !==
                        undefined && (
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "10px",
                            alignItems:
                              "center",
                            marginTop:
                              "15px",
                          }}
                        >

                          <MapPin
                            size={18}
                          />

                          <span>
                            {
                              incident.latitude
                            }
                            ,
                            {" "}
                            {
                              incident.longitude
                            }
                          </span>

                          {mapLink && (
                            <a
                              href={
                                mapLink
                              }
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                marginLeft:
                                  "auto",
                              }}
                            >
                              📍 Open Map
                            </a>
                          )}

                        </div>
                      )}

                    {/* BUTTONS */}

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "10px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "20px",
                      }}
                    >

                      <button
                        onClick={() =>
                          setSelectedIncident(
                            incident
                          )
                        }
                        style={{
                          padding:
                            "10px 16px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "8px",
                          background:
                            "white",
                          cursor:
                            "pointer",
                        }}
                      >
                        View Details
                      </button>

                      {nextStatus && (
                        <button
                          onClick={() =>
                            updateIncidentStatus(
                              incident.id,
                              nextStatus
                            )
                          }
                          style={{
                            padding:
                              "10px 16px",
                            border:
                              "none",
                            borderRadius:
                              "8px",
                            background:
                              "#111827",
                            color:
                              "white",
                            cursor:
                              "pointer",
                          }}
                        >
                          {nextStatus ===
                          "ACKNOWLEDGED"
                            ? "✓ Acknowledge"
                            : nextStatus ===
                              "DISPATCHED"
                            ? "Dispatch"
                            : "✓ Resolve"}
                        </button>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* SELECTED INCIDENT */}

          {selectedIncident && (
            <div
              style={{
                position:
                  "fixed",
                inset:
                  0,
                background:
                  "rgba(0,0,0,0.45)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding:
                  "20px",
                zIndex:
                  100,
              }}
            >

              <div
                style={{
                  background:
                    "white",
                  borderRadius:
                    "18px",
                  padding:
                    "25px",
                  maxWidth:
                    "650px",
                  width:
                    "100%",
                  maxHeight:
                    "85vh",
                  overflowY:
                    "auto",
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >

                  <h2>
                    Incident Details
                  </h2>

                  <button
                    onClick={() =>
                      setSelectedIncident(
                        null
                      )
                    }
                    style={{
                      border:
                        "none",
                      background:
                        "transparent",
                      fontSize:
                        "25px",
                      cursor:
                        "pointer",
                    }}
                  >
                    X
                  </button>

                </div>

                <hr />

                <p>
                  <strong>
                    Incident ID:
                  </strong>{" "}
                  {
                    selectedIncident.id
                  }
                </p>

                <p>
                  <strong>
                    Type:
                  </strong>{" "}
                  {
                    selectedIncident.emergencyType ||
                    selectedIncident.type
                  }
                </p>

                <p>
                  <strong>
                    Severity:
                  </strong>{" "}
                  {
                    selectedIncident.severity
                  }
                </p>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {
                    selectedIncident.status
                  }
                </p>

                <p>
                  <strong>
                    Language:
                  </strong>{" "}
                  {
                    selectedIncident.language ||
                    "English"
                  }
                </p>

                <h3>
                  Description
                </h3>

                <p>
                  {
                    selectedIncident.description
                  }
                </p>

                <h3>
                  Detected Conditions
                </h3>

                <ul>
                  {selectedIncident.conditions?.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {item}
                      </li>
                    )
                  )}
                </ul>

                <h3>
                  Immediate Guidance
                </h3>

                <ol>
                  {selectedIncident.actions?.map(
                    (
                      item,
                      index
                    ) => (
                      <li
                        key={
                          index
                        }
                      >
                        {item}
                      </li>
                    )
                  )}
                </ol>

                {getMapLink(
                  selectedIncident
                ) && (
                  <a
                    href={getMapLink(
                      selectedIncident
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Emergency Location
                  </a>
                )}

              </div>

            </div>
          )}

          {/* DISCLAIMER */}

          <div
            className="notice"
            style={{
              marginTop:
                "30px",
            }}
          >

            <AlertTriangle
              size={24}
            />

            <div>

              <strong>
                Prototype Responder Dashboard
              </strong>

              <p>
                This dashboard is a
                coordination prototype.
                It does not directly
                dispatch police,
                ambulance, fire
                services, 112, or 108.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // HOME PAGE
  // =====================================================

  return (
    <div className="app">

      <nav className="navbar">

        <div className="brand">

          <div className="brand-icon">
            <HeartPulse size={24} />
          </div>

          <div>
            <h2>
              Sahayak AI
            </h2>

            <span>
              Emergency First-Response Assistant
            </span>
          </div>

        </div>

        <div className="nav-actions">

          {/* LANGUAGE */}

          <div
            style={{
              position:
                "relative",
            }}
          >

            <button
              className="language-btn"
              onClick={() =>
                setShowLanguages(
                  !showLanguages
                )
              }
            >
              <Globe size={18} />
              {language}
            </button>

            {showLanguages && (
              <div
                style={{
                  position:
                    "absolute",
                  right: 0,
                  top:
                    "calc(100% + 8px)",
                  background:
                    "white",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius:
                    "12px",
                  padding:
                    "6px",
                  zIndex:
                    50,
                  minWidth:
                    "150px",
                }}
              >

                {[
                  "English",
                    "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41",
                    "\u0939\u093F\u0902\u0926\u0940",
                ].map(
                  (item) => (
                    <button
                      key={
                        item
                      }
                      onClick={() => {
                        setLanguage(
                          item
                        );
                        setShowLanguages(
                          false
                        );
                      }}
                      style={{
                        width:
                          "100%",
                        padding:
                          "10px",
                        border:
                          "none",
                        background:
                          "transparent",
                        textAlign:
                          "left",
                        cursor:
                          "pointer",
                      }}
                    >
                      {item}
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          <button
            className="secondary-btn"
            onClick={() =>
              setShowResponderDashboard(
                true
              )
            }
          >
            <Radio size={18} />

            Responder Dashboard
          </button>

          <button
            className="help-btn"
            onClick={() =>
              setShowEmergency(
                true
              )
            }
          >
            <Phone size={18} />

            Emergency Help
          </button>

        </div>

      </nav>

      <main>

        <section className="hero">

          <div className="hero-content">

            <div className="status-pill">

              <span className="status-dot"></span>

              AI Emergency Assistance Available

            </div>

            <h1>
              When every second
              <span>
                {" "}matters.
              </span>
            </h1>

            <p>
              Sahayak AI helps you understand
              an emergency, take safer immediate
              actions, and communicate critical
              information clearly while
              professional help is being arranged.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() =>
                  setShowEmergency(
                    true
                  )
                }
              >

                <Siren size={21} />

                Start Emergency Assistance

                <ArrowRight
                  size={20}
                />

              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  setShowEmergency(
                    true
                  )
                }
              >

                <Mic size={20} />

                Describe Emergency

              </button>

            </div>

            <div className="trust-row">

              <div>
                <ShieldCheck
                  size={19}
                />
                Safety-focused guidance
              </div>

              <div>
                <Globe
                  size={19}
                />
                Multilingual support
              </div>

              <div>
                <Bot
                  size={19}
                />
                AI-powered analysis
              </div>

            </div>

          </div>

          {/* RIGHT CARD */}

          <div className="emergency-card">

            <div className="card-top">

              <div className="ai-icon">
                <Bot size={28} />
              </div>

              <div>
                <strong>
                  Sahayak AI
                </strong>

                <p>
                  Ready to assist
                </p>
              </div>

              <span className="online-dot"></span>

            </div>

            <div className="card-message">

              <p className="message-label">
                How can I help?
              </p>

              <h3>
                Tell me what happened.
              </h3>

              <p>
                You can type or speak naturally.
                I'll help identify the situation
                and guide you through the next
                steps.
              </p>

            </div>

            <button
              className="voice-box"
              onClick={() =>
                setShowEmergency(
                  true
                )
              }
            >

              <div className="mic-circle">
                <Mic size={24} />
              </div>

              <div>
                <strong>
                  Describe the emergency
                </strong>

                <span>
                  Tap to continue
                </span>
              </div>

            </button>

            <div className="location-box">

              <MapPin size={18} />

              <span>
                Location can be added
                with your permission
              </span>

            </div>

          </div>

        </section>

        {/* HOW IT WORKS */}

        <section className="how-section">

          <div className="section-heading">

            <span>
              HOW IT WORKS
            </span>

            <h2>
              From confusion to
              <span>
                {" "}clear action.
              </span>
            </h2>

            <p>
              Sahayak AI turns an
              unstructured emergency
              description into simple,
              actionable information.
            </p>

          </div>

          <div className="steps">

            <div className="step-card">

              <div className="step-number">
                01
              </div>

              <div className="step-icon">
                <UserRound size={25} />
              </div>

              <h3>
                Describe
              </h3>

              <p>
                Speak or type what is
                happening in your own
                words.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                02
              </div>

              <div className="step-icon">
                <Bot size={25} />
              </div>

              <h3>
                AI Understands
              </h3>

              <p>
                AI identifies the
                emergency type and
                critical details.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                03
              </div>

              <div className="step-icon">
                <CheckCircle
                  size={25}
                />
              </div>

              <h3>
                Take Action
              </h3>

              <p>
                Receive simple
                first-response guidance
                appropriate to the
                situation.
              </p>

            </div>

            <div className="step-card">

              <div className="step-number">
                04
              </div>

              <div className="step-icon">
                <Radio size={25} />
              </div>

              <h3>
                Share Information
              </h3>

              <p>
                Send a structured
                emergency report to
                the responder dashboard.
              </p>

            </div>

          </div>

        </section>

        <section className="notice">

          <AlertTriangle
            size={24}
          />

          <div>

            <strong>
              Important
            </strong>

            <p>
              Sahayak AI provides general
              first-response guidance and
              does not replace professional
              medical or emergency services.
              For serious emergencies,
              contact the appropriate
              emergency service immediately.
            </p>

          </div>

        </section>

      </main>

      <footer>

        <div>

          <strong>
            Sahayak AI
          </strong>

          <span>
            {" "}â€¢ Intelligent emergency assistance
          </span>

        </div>

        <span>
          Built for safer first response.
        </span>

      </footer>

    </div>
  );
}

export default App;



