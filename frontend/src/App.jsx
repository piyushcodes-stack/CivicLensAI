
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import LocationPicker from "./components/LocationPicker";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest, getToken } from "./api";
import "./App.css";

const CATEGORIES = [
  { value: "ROADS", label: "Roads and Potholes" },
  { value: "GARBAGE", label: "Garbage and Waste" },
  { value: "WATER", label: "Water Supply" },
  { value: "ELECTRICITY", label: "Electricity and Streetlights" },
  { value: "DRAINAGE", label: "Drainage and Sewage" },
  { value: "PUBLIC_SAFETY", label: "Public Safety" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  "SUBMITTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

const EMPTY_STATS = {
  total_complaints: 0,
  submitted: 0,
  acknowledged: 0,
  in_progress: 0,
  resolved: 0,
  rejected: 0,
  resolution_rate: 0,
  category_breakdown: [],
};

function displayStatus(status) {
  return (status || "SUBMITTED")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCategory(category) {
  return (
    CATEGORIES.find((item) => item.value === category)?.label ||
    category ||
    "Other"
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const endpoint =
        mode === "login" ? "/auth/login/" : "/auth/register/";

      const body =
        mode === "login"
          ? {
              username: form.username.trim(),
              password: form.password,
            }
          : {
              username: form.username.trim(),
              email: form.email.trim(),
              password: form.password,
              first_name: form.first_name.trim(),
              last_name: form.last_name.trim(),
            };

      const result = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!result.token) {
        throw new Error("The server did not return an authentication token.");
      }

      localStorage.setItem("civiclens_token", result.token);
      localStorage.setItem("civiclens_user", JSON.stringify(result.user));
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message || "Unable to authenticate.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-visual">
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={23} />
          </div>
          <span>CivicLens<span className="brand-ai"> AI</span></span>
        </div>

        <div className="auth-hero">
          <div className="eyebrow">
            <Sparkles size={15} />
            SMARTER CITIES START HERE
          </div>

          <h1>
            Your city.
            <br />
            Your voice.
            <br />
            <span>Real change.</span>
          </h1>

          <p>
            Report civic issues, follow their progress, and help make your
            neighbourhood a better place to live.
          </p>

          <div className="visual-feature">
            <div className="feature-icon">
              <MapPin size={19} />
            </div>
            <div>
              <strong>Every issue matters</strong>
              <span>Make local problems visible.</span>
            </div>
          </div>

          <div className="visual-feature">
            <div className="feature-icon">
              <Activity size={19} />
            </div>
            <div>
              <strong>Progress you can follow</strong>
              <span>Stay informed from report to resolution.</span>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          CIVIC TECHNOLOGY · COMMUNITY FIRST
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <div className="mobile-brand brand">
            <div className="brand-icon">
              <ShieldCheck size={22} />
            </div>
            <span>CivicLens<span className="brand-ai"> AI</span></span>
          </div>

          <span className="section-kicker">
            {mode === "login" ? "WELCOME BACK" : "JOIN YOUR COMMUNITY"}
          </span>

          <h2>
            {mode === "login" ? "Sign in to CivicLens" : "Create your account"}
          </h2>

          <p className="muted">
            {mode === "login"
              ? "Access your complaints and community dashboard."
              : "Start reporting civic issues in your neighbourhood."}
          </p>

          <form onSubmit={submit} className="auth-form">
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={updateField}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </label>

            {mode === "register" && (
              <>
                <label>
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <div className="form-two-columns">
                  <label>
                    First name
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={updateField}
                      placeholder="First name"
                    />
                  </label>

                  <label>
                    Last name
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={updateField}
                      placeholder="Last name"
                    />
                  </label>
                </div>
              </>
            )}

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder="Enter your password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                required
              />
            </label>

            {error && (
              <div className="error-message">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <button className="primary-button auth-submit" disabled={busy}>
              {busy
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "login"
              ? "New to CivicLens AI?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </div>

          <div className="security-note">
            <ShieldCheck size={15} />
            Your account is protected by authentication.
          </div>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("civiclens_user")) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [aiSuggestion, setAiSuggestion] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState("");
const [priorityPrediction, setPriorityPrediction] = useState(null);
const [priorityLoading, setPriorityLoading] = useState(false);
const [priorityError, setPriorityError] = useState("");
const [duplicateResult, setDuplicateResult] = useState(null);
const [duplicateLoading, setDuplicateLoading] = useState(false);
const [duplicateError, setDuplicateError] = useState("");
  

  const [complaintForm, setComplaintForm] = useState({
    title: "",
    description: "",
    category: "ROADS",
    address: "",
    latitude: "",
    longitude: "",
  });

  const isStaff =
    Boolean(user?.is_staff || user?.is_superuser) ||
    ["STAFF", "ADMIN"].includes(user?.role);

    const suggestCategoryWithAI = async () => {
  const title = complaintForm.title.trim();
  const description = complaintForm.description.trim();

  if (!title && !description) {
    setAiError("Enter a complaint title or description first.");
    setAiSuggestion(null);
    return;
  }

  setAiLoading(true);
  setAiError("");
  setAiSuggestion(null);

  try {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again to use AI classification.");
    }

    const response = await fetch(
      "http://127.0.0.1:8000/api/complaints/classify/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "AI classification failed."
      );
    }

    setAiSuggestion(data);
  } catch (error) {
    setAiError(
      error.message ||
        "Unable to connect to the AI classification service."
    );
  } finally {
    setAiLoading(false);
  }
};
const predictComplaintPriority = async () => {
  const title = complaintForm.title.trim();
  const description = complaintForm.description.trim();

  if (!title && !description) {
    setPriorityError("Enter a complaint title or description first.");
    setPriorityPrediction(null);
    return;
  }

  setPriorityLoading(true);
  setPriorityError("");
  setPriorityPrediction(null);

  try {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(
      "http://127.0.0.1:8000/api/complaints/predict-priority/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Priority prediction failed."
      );
    }

    setPriorityPrediction(data);
  } catch (error) {
    setPriorityError(
      error.message || "Unable to connect to the backend."
    );
  } finally {
    setPriorityLoading(false);
  }
};
const checkDuplicateComplaint = async () => {
  const title = complaintForm.title.trim();
  const description = complaintForm.description.trim();

  if (!title && !description) {
    setDuplicateError(
      "Enter a complaint title or description first."
    );
    setDuplicateResult(null);
    return;
  }

  setDuplicateLoading(true);
  setDuplicateError("");
  setDuplicateResult(null);

  try {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in again.");
    }

    const response = await fetch(
      "http://127.0.0.1:8000/api/complaints/check-duplicate/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          data.error ||
          "Duplicate complaint check failed."
      );
    }

    setDuplicateResult(data);
  } catch (error) {
    setDuplicateError(
      error.message ||
        "Unable to connect to the duplicate detection service."
    );
  } finally {
    setDuplicateLoading(false);
  }
};

  const loadDashboard = useCallback(async () => {
    if (!getToken()) return;

    setLoading(true);
    setError("");

    try {
      const [complaintData, analyticsData] = await Promise.all([
        apiRequest("/complaints/"),
        apiRequest("/analytics/dashboard/"),
      ]);

      setComplaints(
        Array.isArray(complaintData)
          ? complaintData
          : complaintData.results || []
      );
      setStats({ ...EMPTY_STATS, ...analyticsData });
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && getToken()) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function logout() {
    localStorage.removeItem("civiclens_token");
    localStorage.removeItem("civiclens_user");
    setUser(null);
    setComplaints([]);
    setStats(EMPTY_STATS);
    setPage("dashboard");
  }

  function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setPage("dashboard");
  }

  async function submitComplaint(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      const payload = {
        title: complaintForm.title.trim(),
        description: complaintForm.description.trim(),
        category: complaintForm.category,
        address: complaintForm.address.trim(),
      };

      if (complaintForm.latitude !== "") {
        payload.latitude = Number(complaintForm.latitude);
      }

      if (complaintForm.longitude !== "") {
        payload.longitude = Number(complaintForm.longitude);
      }

      await apiRequest("/complaints/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setComplaintForm({
        title: "",
        description: "",
        category: "ROADS",
        address: "",
        latitude: "",
        longitude: "",
      });

      setNotice("Your complaint has been submitted successfully.");
      setPage("complaints");
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not submit your complaint.");
    }
  }

  async function changeStatus(complaintId, newStatus) {
    setError("");
    setNotice("");

    try {
      await apiRequest(`/complaints/${complaintId}/update-status/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setNotice(`Complaint status changed to ${displayStatus(newStatus)}.`);
      await loadDashboard();
    } catch (err) {
      setError(err.message || "Could not update complaint status.");
    }
  }

  if (!user || !getToken()) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const visibleComplaints =
    filter === "ALL"
      ? complaints
      : complaints.filter((complaint) => complaint.status === filter);

  const categoryChart = (stats.category_breakdown || []).map((item) => ({
    name: formatCategory(item.category),
    complaints: item.count,
  }));

  const statCards = [
    {
      label: "Total complaints",
      value: stats.total_complaints,
      icon: ClipboardList,
      tone: "violet",
    },
    {
      label: "Awaiting action",
      value: (stats.submitted || 0) + (stats.acknowledged || 0),
      icon: AlertCircle,
      tone: "amber",
    },
    {
      label: "In progress",
      value: stats.in_progress,
      icon: Activity,
      tone: "blue",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      tone: "green",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>
          <span>CivicLens<span className="brand-ai"> AI</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={page === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={page === "complaints" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("complaints")}
          >
            <ClipboardList size={19} />
            {isStaff ? "All complaints" : "My complaints"}
            <span className="nav-count">{complaints.length}</span>
          </button>
          {isStaff && (
  <button
    className={
      page === "analytics" ? "nav-item active" : "nav-item"
    }
    onClick={() => setPage("analytics")}
  >
    <TrendingUp size={19} />
    Analytics
  </button>
)}


          <button
            className={page === "new" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setError("");
              setPage("new");
            }}
          >
            <FilePlus2 size={19} />
            Report an issue
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="community-card">
            <div className="community-icon">
              <Sparkles size={18} />
            </div>
            <strong>Make a difference</strong>
            <p>Every report is a step towards a better community.</p>
          </div>

          <div className="user-profile">
            <div className="avatar">
              {(user.first_name || user.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-details">
              <strong>
                {user.first_name
                  ? `${user.first_name} ${user.last_name || ""}`.trim()
                  : user.username}
              </strong>
              <span>{user.role || (isStaff ? "Staff" : "Citizen")}</span>
            </div>

            <button
              className="icon-button logout-button"
              title="Sign out"
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {page === "dashboard"
  ? "Dashboard"
  : page === "complaints"
    ? "Complaints"
    : page === "analytics"
      ? "Analytics"
      : "Report an issue"}
            </strong>
          </div>

          <div className="topbar-right">
            <span className="live-indicator">
              <span />
              Connected to API
            </span>
            <button
              className="icon-button refresh-button"
              onClick={loadDashboard}
              title="Refresh data"
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "spin" : ""} />
            </button>
          </div>
        </header>

        <div className="page-container">
          {notice && (
            <div className="success-banner">
              <CheckCircle2 size={18} />
              {notice}
            </div>
          )}

          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {page === "dashboard" && (
            <>
              <section className="welcome-section">
                <div>
                  <div className="section-kicker">COMMUNITY OVERVIEW</div>
                  <h1>
                    Good to see you, {user.first_name || user.username}{" "}
                    <span className="wave">✦</span>
                  </h1>
                  <p>
                    Here's what's happening with civic issues in your community.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setError("");
                    setPage("new");
                  }}
                >
                  <FilePlus2 size={18} />
                  Report an issue
                </button>
              </section>

              <section className="stats-grid">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <article className="stat-card" key={card.label}>
                      <div className={`stat-icon ${card.tone}`}>
                        <Icon size={21} />
                      </div>
                      <div className="stat-label">{card.label}</div>
                      <div className="stat-value">
                        {loading ? "—" : card.value ?? 0}
                      </div>
                      <div className="stat-footnote">
                        <span className="stat-dot" />
                        Live database statistics
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="dashboard-grid">
                <article className="panel chart-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Complaints by category</h2>
                      <p>Distribution of reported civic issues</p>
                    </div>
                    <div className="panel-icon">
                      <TrendingUp size={19} />
                    </div>
                  </div>

                  <div className="chart-container">
                    {categoryChart.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={categoryChart}
                          margin={{ top: 12, right: 10, left: -20, bottom: 34 }}
                        >
                          <defs>
                            <linearGradient
                              id="complaintGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#9a87ff"
                                stopOpacity={0.35}
                              />
                              <stop
                                offset="100%"
                                stopColor="#9a87ff"
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            stroke="#292b3b"
                            strokeDasharray="4 4"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "#9a9caf", fontSize: 10 }}
                            angle={-22}
                            textAnchor="end"
                            interval={0}
                          />
                          <YAxis
                            allowDecimals={false}
                            tick={{ fill: "#9a9caf", fontSize: 11 }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#171927",
                              border: "1px solid #34364a",
                              borderRadius: 10,
                              color: "#fff",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="complaints"
                            stroke="#a392ff"
                            strokeWidth={2.5}
                            fill="url(#complaintGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="empty-chart">
                        <TrendingUp size={30} />
                        <strong>No complaint data yet</strong>
                        <span>Submit a complaint to populate this chart.</span>
                      </div>
                    )}
                  </div>
                </article>

                <article className="panel resolution-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Resolution progress</h2>
                      <p>Complaints successfully resolved</p>
                    </div>
                    <div className="panel-icon green">
                      <CheckCircle2 size={19} />
                    </div>
                  </div>

                  <div className="resolution-circle">
                    <div className="resolution-circle-inner">
                      <strong>{stats.resolution_rate || 0}%</strong>
                      <span>Resolved</span>
                    </div>
                  </div>

                  <div className="resolution-summary">
                    <div>
                      <span className="legend-dot green-dot" />
                      Resolved
                      <strong>{stats.resolved || 0}</strong>
                    </div>
                    <div>
                      <span className="legend-dot violet-dot" />
                      Other statuses
                      <strong>
                        {Math.max(
                          0,
                          (stats.total_complaints || 0) -
                            (stats.resolved || 0)
                        )}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              <section className="panel recent-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent complaints</h2>
                    <p>Latest reports from your account</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setPage("complaints")}
                  >
                    View all <ArrowRight size={16} />
                  </button>
                </div>

                <ComplaintTable
                  complaints={complaints.slice(0, 5)}
                  isStaff={isStaff}
                  onChangeStatus={changeStatus}
                />
              </section>
            </>
          )}
        {page === "analytics" && isStaff && (
  <AnalyticsDashboard />
)}

          {page === "complaints" && (
            <section>
              <div className="welcome-section">
                <div>
                  <div className="section-kicker">ISSUE MANAGEMENT</div>
                  <h1>{isStaff ? "Community complaints" : "My complaints"}</h1>
                  <p>
                    {isStaff
                      ? "Review reports and update their progress."
                      : "Track the status of every issue you've reported."}
                  </p>
                </div>

                {!isStaff && (
                  <button
                    className="primary-button"
                    onClick={() => setPage("new")}
                  >
                    <FilePlus2 size={18} /> New complaint
                  </button>
                )}
              </div>

              <div className="filter-row">
                <label htmlFor="status-filter">Filter by status</label>
                <select
                  id="status-filter"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="ALL">All statuses</option>
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {displayStatus(item)}
                    </option>
                  ))}
                </select>
                <span className="filter-count">
                  {visibleComplaints.length} complaint
                  {visibleComplaints.length === 1 ? "" : "s"}
                </span>
              </div>

              <section className="panel recent-panel">
                <ComplaintTable
                  complaints={visibleComplaints}
                  isStaff={isStaff}
                  onChangeStatus={changeStatus}
                />
              </section>
            </section>
          )}

          {page === "new" && (
            <section>
              <div className="welcome-section">
                <div>
                  <div className="section-kicker">COMMUNITY REPORTING</div>
                  <h1>Report a civic issue</h1>
                  <p>
                    Give us the details so the right team can review the problem.
                  </p>
                </div>
              </div>

              <form className="panel complaint-form" onSubmit={submitComplaint}>
                <div className="form-section-heading">
                  <div className="form-heading-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2>Issue details</h2>
                    <p>Fields marked with * are required.</p>
                  </div>
                </div>

                <label>
                  Complaint title *
                  <input
                    value={complaintForm.title}
                    onChange={(event) =>
                      setComplaintForm({
                        ...complaintForm,
                        title: event.target.value,
                      })
                    }
                    placeholder="e.g. Large pothole near the bus stop"
                    maxLength={200}
                    required
                  />
                </label>

                <label>
                  Category *
                  <select
                    value={complaintForm.category}
                    onChange={(event) =>
                      setComplaintForm({
                        ...complaintForm,
                        category: event.target.value,
                      })
                    }
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="ai-classifier">
  <button
    type="button"
    onClick={suggestCategoryWithAI}
    disabled={aiLoading}
  >
    {aiLoading
      ? "Analyzing complaint..."
      : "✨ Suggest Category with AI"}
  </button>

  {aiError && <p className="ai-error">{aiError}</p>}

  {aiSuggestion && (
    <div className="ai-suggestion">
      <p>
        Suggested category: {formatCategory(aiSuggestion.category)}
      </p>
      <p>
        Confidence: {Math.round(aiSuggestion.confidence * 100)}%
      </p>

      <button
        type="button"
        onClick={() => {
          setComplaintForm((previous) => ({
            ...previous,
            category: aiSuggestion.category,
          }));
          setAiSuggestion(null);
          setAiError("");
        }}
      >
        Use Suggested Category
      </button>
    </div>
  )}
</div>
<div className="priority-predictor">
  <button
    type="button"
    onClick={predictComplaintPriority}
    disabled={priorityLoading}
  >
    {priorityLoading
      ? "Analyzing priority..."
      : "🚦 Predict Complaint Priority"}
  </button>

  {priorityError && (
    <p className="priority-error" role="alert">
      {priorityError}
    </p>
  )}

  {priorityPrediction && (
    <div className="priority-result">
      <h3>
        Predicted Priority: {priorityPrediction.priority}
      </h3>

      <p>
        <strong>Baseline score:</strong>{" "}
        {Math.round(priorityPrediction.confidence * 100)}%
      </p>

      <p>
        <strong>Reason:</strong>{" "}
        {priorityPrediction.reason}
      </p>

      <p className="priority-note">
        This is an experimental, keyword-based estimate.
        Please review the complaint manually.
      </p>
    </div>
  )}
</div>
<div className="duplicate-checker">
  <button
    type="button"
    onClick={checkDuplicateComplaint}
    disabled={duplicateLoading}
  >
    {duplicateLoading
      ? "Checking existing complaints..."
      : "🔍 Check for Duplicate Complaints"}
  </button>

  {duplicateError && (
    <p className="duplicate-error" role="alert">
      {duplicateError}
    </p>
  )}

  {duplicateResult && (
    <div className="duplicate-result">
      <h3>
        {duplicateResult.duplicate_found
          ? "⚠️ Similar Complaint Found"
          : "✅ No Similar Complaint Found"}
      </h3>

      <p>{duplicateResult.message}</p>

      {duplicateResult.duplicate_found && (
        <>
          <p>
            <strong>Similar complaint ID:</strong>{" "}
            {duplicateResult.match?.id ?? "Unavailable"}
          </p>

          <p>
            <strong>Text similarity:</strong>{" "}
            {Math.round(
              (duplicateResult.similarity ?? 0) * 100
            )}%
          </p>

          <p className="duplicate-note">
            Please review the existing complaint before
            submitting another report. A similarity match
            does not prove that both reports describe the
            same incident.
          </p>
        </>
      )}
    </div>
  )}
</div>

                <label>
                  Description *
                  <textarea
                    value={complaintForm.description}
                    onChange={(event) =>
                      setComplaintForm({
                        ...complaintForm,
                        description: event.target.value,
                      })
                    }
                    placeholder="Describe the issue, its location, and how it affects the community..."
                    rows={5}
                    required
                  />
                </label>

                <label>
                  Street address or landmark *
                  <input
                    value={complaintForm.address}
                    onChange={(event) =>
                      setComplaintForm({
                        ...complaintForm,
                        address: event.target.value,
                      })
                    }
                    placeholder="e.g. Near Thane station, platform entrance"
                    maxLength={300}
                    required
                  />
                </label>
                <LocationPicker
  latitude={complaintForm.latitude}
  longitude={complaintForm.longitude}
  onLocationSelect={({ latitude, longitude, address }) => {
  setComplaintForm((previous) => ({
    ...previous,
    latitude: String(latitude),
    longitude: String(longitude),
    ...(address ? { address } : {}),
  }));
}}
/>


                <div className="form-two-columns">
                  <label>
                    Latitude <span className="optional-label">Optional</span>
                    <input
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={complaintForm.latitude}
                      onChange={(event) =>
                        setComplaintForm({
                          ...complaintForm,
                          latitude: event.target.value,
                        })
                      }
                      placeholder="19.2183"
                    />
                  </label>

                  <label>
                    Longitude <span className="optional-label">Optional</span>
                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={complaintForm.longitude}
                      onChange={(event) =>
                        setComplaintForm({
                          ...complaintForm,
                          longitude: event.target.value,
                        })
                      }
                      placeholder="72.9781"
                    />
                  </label>
                </div>

                <div className="form-note">
                  <ShieldCheck size={17} />
                  Your report will be linked to your authenticated account.
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setPage("dashboard")}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    <FilePlus2 size={18} />
                    Submit complaint
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        <footer className="main-footer">
          <span>© {new Date().getFullYear()} CivicLens AI</span>
          <span>Building better communities, together.</span>
        </footer>
      </main>
    </div>
  );
}

function ComplaintTable({ complaints, isStaff, onChangeStatus }) {
  if (!complaints.length) {
    return (
      <div className="empty-table">
        <div className="empty-table-icon">
          <ClipboardList size={25} />
        </div>
        <strong>No complaints found</strong>
        <p>Your complaints will appear here once available.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="complaints-table">
        <thead>
          <tr>
            <th>COMPLAINT</th>
            <th>CATEGORY</th>
            <th>STATUS</th>
            <th>DATE</th>
            {isStaff && <th>UPDATE STATUS</th>}
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td>
                <div className="complaint-title">{complaint.title}</div>
                <div className="complaint-address">
                  <MapPin size={12} />
                  {complaint.address}
                </div>
                {isStaff && complaint.reported_by_username && (
                  <div className="complaint-address">
                    By {complaint.reported_by_username}
                  </div>
                )}
              </td>
              <td>
                <span className="category-pill">
                  {formatCategory(complaint.category)}
                </span>
              </td>
              <td>
                <span
                  className={`status-pill status-${(
                    complaint.status || "SUBMITTED"
                  ).toLowerCase()}`}
                >
                  <span />
                  {displayStatus(complaint.status)}
                </span>
              </td>
              <td className="date-cell">
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleDateString()
                  : "—"}
              </td>
              {isStaff && (
                <td>
                  <select
                    className="status-select"
                    value={complaint.status}
                    aria-label={`Update status for ${complaint.title}`}
                    onChange={(event) =>
                      onChangeStatus(complaint.id, event.target.value)
                    }
                  >
                    {STATUSES.map((item) => (
                      <option key={item} value={item}>
                        {displayStatus(item)}
                      </option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;