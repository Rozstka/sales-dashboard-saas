const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export function registerUser(data) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function loginUser(data) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function getLeads(token, filters = {}) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.minValue !== undefined && filters.minValue !== null && filters.minValue !== "") {
    params.set("minValue", String(filters.minValue));
  }

  if (filters.maxValue !== undefined && filters.maxValue !== null && filters.maxValue !== "") {
    params.set("maxValue", String(filters.maxValue));
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  const path = query ? `/leads?${query}` : "/leads";

  return request(path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function createLead(token, data) {
  return request("/leads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export function updateLeadStatus(token, leadId, status) {
  return request(`/leads/${leadId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
}

export function updateLead(token, leadId, data) {
  return request(`/leads/${leadId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
}

export function deleteLead(token, leadId) {
  return request(`/leads/${leadId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function seedDemoLeads(token, replace = false) {
  return request("/leads/seed-demo", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ replace })
  });
}

export function getSummary(token) {
  return request("/leads/stats/summary", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getCharts(token) {
  return request("/leads/stats/charts", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
