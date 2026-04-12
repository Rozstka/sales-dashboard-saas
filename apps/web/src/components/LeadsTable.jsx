import { Fragment, useState } from "react";

const statuses = ["new", "in_progress", "won", "lost"];

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function toEditState(lead) {
  return {
    companyName: lead.companyName || "",
    contactName: lead.contactName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    status: lead.status || "new",
    value: lead.value ?? 0
  };
}

export default function LeadsTable({
  leads,
  onStatusChange,
  onUpdateLead,
  onDeleteLead,
  loading
}) {
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [editLead, setEditLead] = useState(null);

  const isEditing = (leadId) => editingLeadId === leadId;

  function startEdit(lead) {
    setEditingLeadId(lead.id);
    setEditLead(toEditState(lead));
  }

  function cancelEdit() {
    setEditingLeadId(null);
    setEditLead(null);
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (!editingLeadId || !editLead) {
      return;
    }

    const success = await onUpdateLead(editingLeadId, {
      ...editLead,
      value: Number(editLead.value || 0)
    });

    if (success) {
      cancelEdit();
    }
  }

  async function removeLead(leadId) {
    if (!window.confirm("Delete this lead? This action cannot be undone.")) {
      return;
    }

    const success = await onDeleteLead(leadId);
    if (success && isEditing(leadId)) {
      cancelEdit();
    }
  }

  return (
    <section className="panel table-panel">
      <h3>Leads</h3>
      {leads.length === 0 ? (
        <p className="empty">No leads yet. Add your first lead.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Value</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <Fragment key={lead.id}>
                  <tr>
                    <td>{lead.companyName}</td>
                    <td>
                      <div>{lead.contactName}</div>
                      {lead.email && <small>{lead.email}</small>}
                    </td>
                    <td>
                      <select
                        disabled={loading}
                        value={lead.status}
                        onChange={(event) =>
                          onStatusChange(lead.id, event.target.value)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>${Number(lead.value).toLocaleString()}</td>
                    <td>{formatDate(lead.createdAt)}</td>
                    <td className="actions-cell">
                      <div className="actions-group">
                        <button
                          className="table-btn"
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            isEditing(lead.id) ? cancelEdit() : startEdit(lead)
                          }
                        >
                          {isEditing(lead.id) ? "Close" : "Edit"}
                        </button>
                        <button
                          className="table-btn danger"
                          type="button"
                          disabled={loading}
                          onClick={() => removeLead(lead.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isEditing(lead.id) && editLead && (
                    <tr className="edit-row">
                      <td colSpan={6}>
                        <form className="edit-form" onSubmit={saveEdit}>
                          <div className="edit-grid">
                            <label>
                              Company
                              <input
                                required
                                minLength={2}
                                value={editLead.companyName}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    companyName: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Contact name
                              <input
                                required
                                minLength={2}
                                value={editLead.contactName}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    contactName: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Email
                              <input
                                type="email"
                                value={editLead.email}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    email: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Phone
                              <input
                                value={editLead.phone}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    phone: event.target.value
                                  }))
                                }
                              />
                            </label>
                            <label>
                              Status
                              <select
                                value={editLead.status}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    status: event.target.value
                                  }))
                                }
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              Value
                              <input
                                type="number"
                                min="0"
                                value={editLead.value}
                                onChange={(event) =>
                                  setEditLead((prev) => ({
                                    ...prev,
                                    value: event.target.value
                                  }))
                                }
                              />
                            </label>
                          </div>
                          <div className="edit-actions">
                            <button className="table-btn primary" disabled={loading} type="submit">
                              Save
                            </button>
                            <button
                              className="table-btn"
                              type="button"
                              disabled={loading}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
