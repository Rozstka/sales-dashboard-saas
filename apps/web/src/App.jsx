import { useEffect, useMemo, useState } from "react";
import {
  createLead,
  deleteLead,
  getCharts,
  getLeads,
  getSummary,
  loginUser,
  registerUser,
  seedDemoLeads,
  updateLead,
  updateLeadStatus
} from "./api";
import AuthForm from "./components/AuthForm";
import ChartsPanel from "./components/ChartsPanel";
import LeadForm from "./components/LeadForm";
import LeadsFilters from "./components/LeadsFilters";
import LeadsTable from "./components/LeadsTable";
import SummaryCards from "./components/SummaryCards";

const TOKEN_KEY = "sales_dashboard_token";
const USER_KEY = "sales_dashboard_user";
const initialLeadFilters = {
  search: "",
  status: "all",
  minValue: "",
  maxValue: "",
  sort: "created_desc"
};

export default function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({
    statusCounts: [],
    statusValues: [],
    monthlyWonValues: []
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialLeadFilters);
  const [debouncedSearch, setDebouncedSearch] = useState(initialLeadFilters.search);

  const isAuthenticated = useMemo(() => Boolean(token && user), [token, user]);
  const leadsQuery = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch
    }),
    [filters, debouncedSearch]
  );

  async function refreshAnalytics(currentToken) {
    const [summaryData, chartsData] = await Promise.all([
      getSummary(currentToken),
      getCharts(currentToken)
    ]);
    setSummary(summaryData);
    setCharts(chartsData);
  }

  async function refreshLeads(currentToken, currentFilters = leadsQuery) {
    const leadsData = await getLeads(currentToken, currentFilters);
    setLeads(leadsData);
  }

  async function refreshDashboard(currentToken, currentFilters = leadsQuery) {
    const [leadsData, summaryData, chartsData] = await Promise.all([
      getLeads(currentToken, currentFilters),
      getSummary(currentToken),
      getCharts(currentToken)
    ]);
    setLeads(leadsData);
    setSummary(summaryData);
    setCharts(chartsData);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    if (!token) {
      return;
    }
    setLoading(true);
    setMessage("");
    refreshAnalytics(token)
      .catch((error) => {
        setMessage(error.message);
        handleLogout();
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    setLoading(true);
    setMessage("");
    refreshLeads(token, leadsQuery)
      .catch((error) => {
        setMessage(error.message);
      })
      .finally(() => setLoading(false));
  }, [token, leadsQuery]);

  function handleLoginSuccess(payload) {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  }

  async function handleAuthSubmit(formData) {
    try {
      setLoading(true);
      setMessage("");
      const payload =
        mode === "login"
          ? await loginUser({
              email: formData.email,
              password: formData.password
            })
          : await registerUser(formData);
      handleLoginSuccess(payload);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setLeads([]);
    setSummary({});
    setCharts({
      statusCounts: [],
      statusValues: [],
      monthlyWonValues: []
    });
    setFilters(initialLeadFilters);
    setDebouncedSearch(initialLeadFilters.search);
  }

  async function handleCreateLead(newLead) {
    try {
      setLoading(true);
      setMessage("");
      await createLead(token, newLead);
      await refreshDashboard(token);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(leadId, status) {
    try {
      setLoading(true);
      setMessage("");
      await updateLeadStatus(token, leadId, status);
      await refreshDashboard(token);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateLead(leadId, leadData) {
    try {
      setLoading(true);
      setMessage("");
      await updateLead(token, leadId, leadData);
      await refreshDashboard(token, leadsQuery);
      setMessage("Lead updated.");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLead(leadId) {
    try {
      setLoading(true);
      setMessage("");
      await deleteLead(token, leadId);
      await refreshDashboard(token, leadsQuery);
      setMessage("Lead deleted.");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(field, value) {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function handleResetFilters() {
    setFilters(initialLeadFilters);
    setDebouncedSearch(initialLeadFilters.search);
  }

  async function handleSeedDemo(replace) {
    try {
      setLoading(true);
      setMessage("");
      await seedDemoLeads(token, replace);
      await refreshDashboard(token, leadsQuery);
      setMessage(
        replace
          ? "Leads were replaced with demo data."
          : "Demo leads were added."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">MVP project</p>
          <h1>Sales Dashboard SaaS</h1>
        </div>
        {isAuthenticated && (
          <div className="user-bar">
            <p>{user.fullName}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      {message && <p className="message">{message}</p>}

      {!isAuthenticated ? (
        <main className="auth-layout">
          <AuthForm mode={mode} loading={loading} onSubmit={handleAuthSubmit} />
          <article className="panel info-panel">
            <h2>What this MVP includes</h2>
            <ul>
              <li>Authentication with JWT</li>
              <li>Leads CRUD with PostgreSQL</li>
              <li>Status analytics and dashboard cards</li>
              <li>Ready-to-scale monorepo structure</li>
            </ul>
            <button
              className="switch"
              onClick={() =>
                setMode((prev) => (prev === "login" ? "register" : "login"))
              }
            >
              {mode === "login"
                ? "Need account? Create one"
                : "Already have account? Log in"}
            </button>
          </article>
        </main>
      ) : (
        <main className="dashboard-layout">
          <SummaryCards summary={summary} />
          <ChartsPanel charts={charts} />
          <section className="dashboard-main">
            <LeadForm onCreate={handleCreateLead} loading={loading} />
            <div className="table-area">
              <LeadsFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
                onSeedDemo={() => handleSeedDemo(false)}
                onReplaceWithDemo={() => handleSeedDemo(true)}
                loading={loading}
              />
              <LeadsTable
                leads={leads}
                onStatusChange={handleUpdateStatus}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                loading={loading}
              />
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
