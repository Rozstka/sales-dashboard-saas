import { transaction } from "../db.js";

const demoLeadTemplates = [
  {
    companyName: "Nova Logistics",
    contactName: "Emma Walker",
    email: "emma@example.invalid",
    phone: "+1-202-555-0115",
    status: "new",
    value: 2400
  },
  {
    companyName: "Atlas Retail",
    contactName: "Daniel Price",
    email: "daniel@example.invalid",
    phone: "+1-202-555-0116",
    status: "in_progress",
    value: 6800
  },
  {
    companyName: "Bright Health",
    contactName: "Sophia Reed",
    email: "sophia@example.invalid",
    phone: "+1-202-555-0117",
    status: "won",
    value: 15900
  },
  {
    companyName: "Orbit Finance",
    contactName: "Liam Brooks",
    email: "liam@example.invalid",
    phone: "+1-202-555-0118",
    status: "lost",
    value: 4200
  },
  {
    companyName: "GreenGrid Energy",
    contactName: "Mia Stone",
    email: "mia@example.invalid",
    phone: "+1-202-555-0119",
    status: "in_progress",
    value: 9800
  },
  {
    companyName: "Skyline Systems",
    contactName: "Noah Carter",
    email: "noah@example.invalid",
    phone: "+1-202-555-0120",
    status: "won",
    value: 12300
  }
];

function mapLeadRow(row) {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    value: Number(row.value),
    createdAt: row.created_at
  };
}

export async function seedDemoLeadsForUser(userId, options = {}) {
  return transaction(async (query) => {
  const clearExisting = Boolean(options.clearExisting);

  if (clearExisting) {
    await query("DELETE FROM leads WHERE owner_id = $1", [userId]);
  }

  const insertedLeads = [];
  for (const lead of demoLeadTemplates) {
    const result = await query(
      `
      INSERT INTO leads (owner_id, company_name, contact_name, email, phone, status, value)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, company_name, contact_name, email, phone, status, value, created_at
      `,
      [
        userId,
        lead.companyName,
        lead.contactName,
        lead.email,
        lead.phone,
        lead.status,
        lead.value
      ]
    );

    insertedLeads.push(mapLeadRow(result.rows[0]));
  }

  return insertedLeads;
  });
}
