const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:4000/api";

function buildLeadsQuery(filters = {}) {
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
  return query ? `?${query}` : "";
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
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
  const path = `/leads${buildLeadsQuery(filters)}`;

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

export async function exportLeadsCsv(token, filters = {}) {
  const response = await fetch(`${API_BASE}/leads/export.csv${buildLeadsQuery(filters)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    let message = "CSV export failed";
    try {
      const payload = await response.json();
      message = payload?.message || message;
    } catch {
      // Ignore parse failure and use fallback message.
    }
    throw new Error(message);
  }

  const contentDisposition = response.headers.get("content-disposition") || "";
  const nameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  const filename = nameMatch?.[1] || "leads-export.csv";

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
