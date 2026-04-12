import { useState } from "react";

const initialLead = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  status: "new",
  value: 0
};

export default function LeadForm({ onCreate, loading }) {
  const [lead, setLead] = useState(initialLead);

  const submit = async (event) => {
    event.preventDefault();
    await onCreate({
      ...lead,
      value: Number(lead.value || 0)
    });
    setLead(initialLead);
  };

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h3>Add lead</h3>
      <label>
        Company
        <input
          value={lead.companyName}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, companyName: event.target.value }))
          }
          required
        />
      </label>
      <label>
        Contact name
        <input
          value={lead.contactName}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, contactName: event.target.value }))
          }
          required
        />
      </label>
      <label>
        Contact email
        <input
          type="email"
          value={lead.email}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, email: event.target.value }))
          }
        />
      </label>
      <label>
        Phone
        <input
          value={lead.phone}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, phone: event.target.value }))
          }
        />
      </label>
      <label>
        Status
        <select
          value={lead.status}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, status: event.target.value }))
          }
        >
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </label>
      <label>
        Deal value ($)
        <input
          type="number"
          min="0"
          value={lead.value}
          onChange={(event) =>
            setLead((prev) => ({ ...prev, value: event.target.value }))
          }
        />
      </label>
      <button disabled={loading} type="submit">
        {loading ? "Saving..." : "Create lead"}
      </button>
    </form>
  );
}
