import { useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Radio,
  ShieldAlert,
  Siren,
  Users,
} from "lucide-react";

function ResponderDashboard({ onBack }) {
  const [incidents, setIncidents] = useState([
    {
      id: "SH-1001",
      type: "Road Accident",
      description:
        "Person unconscious and bleeding heavily after a road accident.",
      severity: "CRITICAL",
      location: {
        latitude: 17.385,
        longitude: 78.4867,
      },
      time: "Just now",
      status: "NEW",
      conditions: [
        "Unconscious person",
        "Heavy bleeding",
      ],
    },

    {
      id: "SH-1002",
      type: "Fire Emergency",
      description:
        "Fire reported in a building. People may be trapped inside.",
      severity: "HIGH",
      location: {
        latitude: 17.4065,
        longitude: 78.4772,
      },
      time: "5 min ago",
      status: "ACKNOWLEDGED",
      conditions: [
        "Building fire",
        "Possible trapped people",
      ],
    },

    {
      id: "SH-1003",
      type: "Medical Emergency",
      description:
        "Person experiencing serious breathing difficulty.",
      severity: "HIGH",
      location: {
        latitude: 17.3616,
        longitude: 78.4747,
      },
      time: "12 min ago",
      status: "DISPATCHED",
      conditions: [
        "Breathing difficulty",
      ],
    },

    {
      id: "SH-1004",
      type: "Burn Injury",
      description:
        "Person suffered a burn injury.",
      severity: "MEDIUM",
      location: {
        latitude: 17.4156,
        longitude: 78.4347,
      },
      time: "20 min ago",
      status: "RESOLVED",
      conditions: [
        "Burn injury",
      ],
    },
  ]);

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [filter, setFilter] =
    useState("ALL");

  const criticalCount = incidents.filter(
    (incident) =>
      incident.severity === "CRITICAL"
  ).length;

  const highCount = incidents.filter(
    (incident) =>
      incident.severity === "HIGH"
  ).length;

  const mediumCount = incidents.filter(
    (incident) =>
      incident.severity === "MEDIUM"
  ).length;

  const activeCount = incidents.filter(
    (incident) =>
      incident.status !== "RESOLVED"
  ).length;

  const filteredIncidents = useMemo(() => {
    if (filter === "ALL") {
      return incidents;
    }

    if (filter === "ACTIVE") {
      return incidents.filter(
        (incident) =>
          incident.status !== "RESOLVED"
      );
    }

    return incidents.filter(
      (incident) =>
        incident.severity === filter
    );
  }, [incidents, filter]);

  const updateStatus = (
    incidentId,
    newStatus
  ) => {
    setIncidents((previous) =>
      previous.map((incident) =>
        incident.id === incidentId
          ? {
              ...incident,
              status: newStatus,
            }
          : incident
      )
    );

    setSelectedIncident((previous) =>
      previous
        ? {
            ...previous,
            status: newStatus,
          }
        : null
    );
  };

  const openMap = (incident) => {
    const url = `https://www.google.com/maps?q=${incident.location.latitude},${incident.location.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const severityClass = (severity) => {
    return severity.toLowerCase();
  };

  const statusClass = (status) => {
    return status.toLowerCase();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#ffffff",
          borderBottom:
            "1px solid #e2e8f0",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "13px",
              background: "#0f766e",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Siren size={25} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              Sahayak AI
            </h1>

            <p
              style={{
                margin: "3px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Responder Command Dashboard
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 13px",
              borderRadius: "10px",
              background: "#ecfdf5",
              color: "#047857",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />

            System Online
          </div>

          <button
            onClick={onBack}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              borderRadius: "10px",
              padding: "10px 15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontWeight: "600",
            }}
          >
            <ArrowLeft size={17} />
            Citizen View
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        {/* TITLE */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#b91c1c",
              fontSize: "13px",
              fontWeight: "700",
              letterSpacing: "0.08em",
            }}
          >
            <Radio size={17} />
            LIVE INCIDENT MONITORING
          </div>

          <h2
            style={{
              fontSize: "32px",
              margin:
                "8px 0 5px",
            }}
          >
            Emergency Response Center
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Monitor incidents, prioritize emergencies,
            and coordinate response actions.
          </p>
        </div>

        {/* STAT CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* ACTIVE */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Active Incidents
                </p>

                <h3
                  style={{
                    margin:
                      "8px 0 0",
                    fontSize: "30px",
                  }}
                >
                  {activeCount}
                </h3>
              </div>

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "11px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert size={22} />
              </div>
            </div>
          </div>

          {/* CRITICAL */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #fecaca",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Critical
            </p>

            <h3
              style={{
                margin:
                  "8px 0 0",
                fontSize: "30px",
                color: "#b91c1c",
              }}
            >
              {criticalCount}
            </h3>
          </div>

          {/* HIGH */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #fed7aa",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#c2410c",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              High Priority
            </p>

            <h3
              style={{
                margin:
                  "8px 0 0",
                fontSize: "30px",
                color: "#c2410c",
              }}
            >
              {highCount}
            </h3>
          </div>

          {/* MEDIUM */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #fde68a",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#a16207",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Medium
            </p>

            <h3
              style={{
                margin:
                  "8px 0 0",
                fontSize: "30px",
                color: "#a16207",
              }}
            >
              {mediumCount}
            </h3>
          </div>
        </div>

        {/* FILTERS */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          {[
            ["ALL", "All Incidents"],
            ["ACTIVE", "Active"],
            ["CRITICAL", "Critical"],
            ["HIGH", "High"],
            ["MEDIUM", "Medium"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() =>
                setFilter(value)
              }
              style={{
                border:
                  filter === value
                    ? "1px solid #0f766e"
                    : "1px solid #cbd5e1",
                background:
                  filter === value
                    ? "#0f766e"
                    : "#ffffff",
                color:
                  filter === value
                    ? "#ffffff"
                    : "#334155",
                borderRadius: "9px",
                padding:
                  "9px 15px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CONTENT */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              selectedIncident
                ? "1fr 380px"
                : "1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* INCIDENT LIST */}

          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderBottom:
                  "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                  }}
                >
                  Active Emergency Feed
                </h3>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {filteredIncidents.length} incidents
                  shown
                </p>
              </div>

              <Users size={21} />
            </div>

            <div>
              {filteredIncidents.map(
                (incident) => (
                  <div
                    key={incident.id}
                    style={{
                      padding: "20px",
                      borderBottom:
                        "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "15px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "13px",
                        }}
                      >
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius:
                              "11px",
                            background:
                              incident.severity ===
                              "CRITICAL"
                                ? "#fee2e2"
                                : incident.severity ===
                                  "HIGH"
                                ? "#ffedd5"
                                : "#fef3c7",
                            color:
                              incident.severity ===
                              "CRITICAL"
                                ? "#b91c1c"
                                : incident.severity ===
                                  "HIGH"
                                ? "#c2410c"
                                : "#a16207",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            flexShrink: 0,
                          }}
                        >
                          <AlertTriangle
                            size={21}
                          />
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "9px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize:
                                  "17px",
                              }}
                            >
                              {incident.type}
                            </h3>

                            <span
                              style={{
                                padding:
                                  "4px 8px",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "11px",
                                fontWeight:
                                  "800",
                                background:
                                  incident.severity ===
                                  "CRITICAL"
                                    ? "#fee2e2"
                                    : incident.severity ===
                                      "HIGH"
                                    ? "#ffedd5"
                                    : "#fef3c7",
                                color:
                                  incident.severity ===
                                  "CRITICAL"
                                    ? "#b91c1c"
                                    : incident.severity ===
                                      "HIGH"
                                    ? "#c2410c"
                                    : "#a16207",
                              }}
                            >
                              {incident.severity}
                            </span>
                          </div>

                          <p
                            style={{
                              margin:
                                "7px 0",
                              color:
                                "#64748b",
                              fontSize:
                                "14px",
                              lineHeight:
                                "1.5",
                            }}
                          >
                            {
                              incident.description
                            }
                          </p>

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "14px",
                              flexWrap:
                                "wrap",
                              color:
                                "#64748b",
                              fontSize:
                                "12px",
                            }}
                          >
                            <span>
                              ID:{" "}
                              {
                                incident.id
                              }
                            </span>

                            <span>
                              <Clock
                                size={
                                  13
                                }
                                style={{
                                  verticalAlign:
                                    "middle",
                                  marginRight:
                                    "4px",
                                }}
                              />
                              {
                                incident.time
                              }
                            </span>

                            <span>
                              <MapPin
                                size={
                                  13
                                }
                                style={{
                                  verticalAlign:
                                    "middle",
                                  marginRight:
                                    "4px",
                                }}
                              />
                              Location available
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            padding:
                              "6px 9px",
                            borderRadius:
                              "8px",
                            background:
                              "#f1f5f9",
                            color:
                              "#475569",
                            fontSize:
                              "11px",
                            fontWeight:
                              "700",
                          }}
                        >
                          {
                            incident.status
                          }
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        marginTop:
                          "15px",
                        display:
                          "flex",
                        gap: "8px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          setSelectedIncident(
                            incident
                          )
                        }
                        style={{
                          border:
                            "1px solid #cbd5e1",
                          background:
                            "#ffffff",
                          borderRadius:
                            "8px",
                          padding:
                            "8px 13px",
                          cursor:
                            "pointer",
                          fontWeight:
                            "600",
                        }}
                      >
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          openMap(
                            incident
                          )
                        }
                        style={{
                          border:
                            "1px solid #99f6e4",
                          background:
                            "#f0fdfa",
                          color:
                            "#0f766e",
                          borderRadius:
                            "8px",
                          padding:
                            "8px 13px",
                          cursor:
                            "pointer",
                          fontWeight:
                            "600",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "5px",
                        }}
                      >
                        <MapPin
                          size={15}
                        />
                        Map
                      </button>

                      {incident.status ===
                        "NEW" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              incident.id,
                              "ACKNOWLEDGED"
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "#0f766e",
                            color:
                              "#ffffff",
                            borderRadius:
                              "8px",
                            padding:
                              "8px 13px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600",
                          }}
                        >
                          Acknowledge
                        </button>
                      )}

                      {incident.status ===
                        "ACKNOWLEDGED" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              incident.id,
                              "DISPATCHED"
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "#2563eb",
                            color:
                              "#ffffff",
                            borderRadius:
                              "8px",
                            padding:
                              "8px 13px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600",
                          }}
                        >
                          Dispatch
                        </button>
                      )}

                      {incident.status ===
                        "DISPATCHED" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              incident.id,
                              "RESOLVED"
                            )
                          }
                          style={{
                            border:
                              "none",
                            background:
                              "#16a34a",
                            color:
                              "#ffffff",
                            borderRadius:
                              "8px",
                            padding:
                              "8px 13px",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600",
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* DETAILS PANEL */}

          {selectedIncident && (
            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "22px",
                position: "sticky",
                top: "100px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom:
                    "18px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                  }}
                >
                  Incident Details
                </h3>

                <button
                  onClick={() =>
                    setSelectedIncident(
                      null
                    )
                  }
                  style={{
                    border: "none",
                    background:
                      "#f1f5f9",
                    borderRadius:
                      "8px",
                    padding: "7px 10px",
                    cursor:
                      "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  padding: "15px",
                  borderRadius:
                    "12px",
                  background:
                    selectedIncident.severity ===
                    "CRITICAL"
                      ? "#fff1f2"
                      : "#f8fafc",
                  marginBottom:
                    "18px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                  }}
                >
                  INCIDENT
                </p>

                <h2
                  style={{
                    margin:
                      "5px 0",
                  }}
                >
                  {
                    selectedIncident.type
                  }
                </h2>

                <strong>
                  {
                    selectedIncident.severity
                  }
                </strong>
              </div>

              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 7px",
                    color:
                      "#64748b",
                    fontSize:
                      "12px",
                  }}
                >
                  DESCRIPTION
                </p>

                <p
                  style={{
                    margin: 0,
                    lineHeight:
                      "1.6",
                  }}
                >
                  {
                    selectedIncident.description
                  }
                </p>
              </div>

              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 7px",
                    color:
                      "#64748b",
                    fontSize:
                      "12px",
                  }}
                >
                  DETECTED CONDITIONS
                </p>

                {selectedIncident.conditions.map(
                  (
                    condition,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        padding:
                          "8px 10px",
                        background:
                          "#f8fafc",
                        borderRadius:
                          "8px",
                        marginBottom:
                          "6px",
                        fontSize:
                          "13px",
                      }}
                    >
                      • {condition}
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 7px",
                    color:
                      "#64748b",
                    fontSize:
                      "12px",
                  }}
                >
                  STATUS
                </p>

                <strong>
                  {
                    selectedIncident.status
                  }
                </strong>
              </div>

              <button
                onClick={() =>
                  openMap(
                    selectedIncident
                  )
                }
                style={{
                  width: "100%",
                  border: "none",
                  background:
                    "#0f766e",
                  color: "#ffffff",
                  borderRadius:
                    "10px",
                  padding: "12px",
                  cursor:
                    "pointer",
                  fontWeight:
                    "700",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                }}
              >
                <MapPin size={18} />
                Open Emergency Location
              </button>

              <div
                style={{
                  marginTop:
                    "12px",
                  padding: "12px",
                  borderRadius:
                    "10px",
                  background:
                    "#f8fafc",
                  fontSize:
                    "13px",
                  color:
                    "#475569",
                }}
              >
                <strong>
                  Coordinates
                </strong>

                <br />

                {selectedIncident.location.latitude.toFixed(
                  6
                )}

                {" , "}

                {selectedIncident.location.longitude.toFixed(
                  6
                )}
              </div>

              <div
                style={{
                  marginTop:
                    "18px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "8px",
                  color:
                    "#047857",
                  fontSize:
                    "13px",
                }}
              >
                <CheckCircle
                  size={17}
                />

                Incident lifecycle tracked
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NOTE */}

        <div
          style={{
            marginTop: "25px",
            padding: "16px",
            borderRadius: "12px",
            background: "#fff7ed",
            border:
              "1px solid #fed7aa",
            color: "#9a3412",
            fontSize: "13px",
          }}
        >
          <strong>Demo mode:</strong>{" "}
          These incidents are sample responder
          records for the hackathon demonstration.
          Live emergency dispatch to 112/108 is
          not connected.
        </div>
      </main>
    </div>
  );
}

export default ResponderDashboard;