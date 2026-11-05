import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { authGuard } from "../middleware/auth.js";
import { seedDemoLeadsForUser } from "../services/demo-leads.js";

export const leadsRouter = Router();
const leadStatuses = ["new", "in_progress", "won", "lost"];
const leadStatusLabels = {
  new: "New",
  in_progress: "In progress",
  won: "Won",
  lost: "Lost"
};
const leadSortOptions = {
  created_desc: "created_at DESC",
  created_asc: "created_at ASC",
  value_desc: "value DESC",
  value_asc: "value ASC"
};

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

function parseLeadId(rawLeadId) {
  const leadId = Number(rawLeadId);
  return Number.isSafeInteger(leadId) && leadId > 0 && leadId <= 2147483647 ? leadId : null;
}

const leadSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(leadStatuses).default("new"),
  value: z.coerce.number().min(0).max(1000000000).default(0)
});

const updateStatusSchema = z.object({
  status: z.enum(leadStatuses)
});

const seedDemoSchema = z.object({
  replace: z.boolean().optional().default(false)
});

const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  status: z.enum([...leadStatuses, "all"]).optional().default("all"),
  minValue: z.preprocess(
    (value) => (value === undefined || value === "" ? undefined : Number(value)),
    z.number().min(0).optional()
  ),
  maxValue: z.preprocess(
    (value) => (value === undefined || value === "" ? undefined : Number(value)),
    z.number().min(0).optional()
  ),
  sort: z
    .enum(["created_desc", "created_asc", "value_desc", "value_asc"])
    .optional()
    .default("created_desc")
});

function buildLeadsQueryContext(userId, filters) {
  const whereClauses = ["owner_id = $1"];
  const values = [userId];
  let placeholder = 2;

  if (filters.search) {
    whereClauses.push(
      `(company_name ILIKE $${placeholder} OR contact_name ILIKE $${placeholder} OR COALESCE(email, '') ILIKE $${placeholder})`
    );
    values.push(`%${filters.search}%`);
    placeholder += 1;
  }

  if (filters.status !== "all") {
    whereClauses.push(`status = $${placeholder}`);
    values.push(filters.status);
    placeholder += 1;
  }

  if (filters.minValue !== undefined) {
    whereClauses.push(`value >= $${placeholder}`);
    values.push(filters.minValue);
    placeholder += 1;
  }

  if (filters.maxValue !== undefined) {
    whereClauses.push(`value <= $${placeholder}`);
    values.push(filters.maxValue);
    placeholder += 1;
  }

  const orderBy = leadSortOptions[filters.sort] || leadSortOptions.created_desc;

  return {
    whereSql: whereClauses.join(" AND "),
    values,
    orderBy
  };
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const safe = typeof value === "string" && /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
  const normalized = String(safe).replace(/"/g, "\"\"");
  if (/[",\n\r]/.test(normalized)) {
    return `"${normalized}"`;
  }

  return normalized;
}

leadsRouter.use(authGuard);

leadsRouter.get("/stats/summary", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT
        COUNT(*)::INT AS total,
        COUNT(*) FILTER (WHERE status = 'new')::INT AS new_count,
        COUNT(*) FILTER (WHERE status = 'in_progress')::INT AS in_progress_count,
        COUNT(*) FILTER (WHERE status = 'won')::INT AS won_count,
        COUNT(*) FILTER (WHERE status = 'lost')::INT AS lost_count,
        COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0)::NUMERIC AS won_value
      FROM leads
      WHERE owner_id = $1
      `,
      [req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

leadsRouter.get("/stats/charts", async (req, res, next) => {
  try {
    const statusAggResult = await query(
      `
      SELECT
        status,
        COUNT(*)::INT AS lead_count,
        COALESCE(SUM(value), 0)::NUMERIC AS total_value
      FROM leads
      WHERE owner_id = $1
      GROUP BY status
      `,
      [req.user.id]
    );

    const statusMap = {};
    statusAggResult.rows.forEach((row) => {
      statusMap[row.status] = {
        count: Number(row.lead_count),
        value: Number(row.total_value)
      };
    });

    const statusCounts = leadStatuses.map((status) => ({
      status,
      label: leadStatusLabels[status],
      count: statusMap[status]?.count || 0
    }));

    const statusValues = leadStatuses.map((status) => ({
      status,
      label: leadStatusLabels[status],
      value: statusMap[status]?.value || 0
    }));

    const monthlyWonResult = await query(
      `
      WITH months AS (
        SELECT
          date_trunc('month', NOW()) - (INTERVAL '1 month' * gs.month_offset) AS month_start
        FROM generate_series(5, 0, -1) AS gs(month_offset)
      )
      SELECT
        TO_CHAR(months.month_start, 'Mon YYYY') AS label,
        COALESCE(SUM(leads.value), 0)::NUMERIC AS won_value
      FROM months
      LEFT JOIN leads
        ON leads.owner_id = $1
       AND leads.status = 'won'
       AND date_trunc('month', leads.created_at) = months.month_start
      GROUP BY months.month_start
      ORDER BY months.month_start
      `,
      [req.user.id]
    );

    return res.json({
      statusCounts,
      statusValues,
      monthlyWonValues: monthlyWonResult.rows.map((row) => ({
        label: row.label,
        value: Number(row.won_value)
      }))
    });
  } catch (error) {
    return next(error);
  }
});

leadsRouter.get("/", async (req, res, next) => {
  try {
    const filters = listLeadsQuerySchema.parse(req.query);
    const { whereSql, values, orderBy } = buildLeadsQueryContext(req.user.id, filters);
    const result = await query(
      `
      SELECT
        id,
        company_name,
        contact_name,
        email,
        phone,
        status,
        value,
        created_at
      FROM leads
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      `,
      values
    );

    return res.json(result.rows.map(mapLeadRow));
  } catch (error) {
    return next(error);
  }
});

leadsRouter.get("/export.csv", async (req, res, next) => {
  try {
    const filters = listLeadsQuerySchema.parse(req.query);
    const { whereSql, values, orderBy } = buildLeadsQueryContext(req.user.id, filters);
    const result = await query(
      `
      SELECT
        id,
        company_name,
        contact_name,
        email,
        phone,
        status,
        value,
        created_at
      FROM leads
      WHERE ${whereSql}
      ORDER BY ${orderBy}
      `,
      values
    );

    const columns = [
      "ID",
      "Company",
      "Contact Name",
      "Email",
      "Phone",
      "Status",
      "Value",
      "Created At (ISO)"
    ];

    const csvRows = [columns.join(",")];
    for (const row of result.rows) {
      const lineValues = [
        row.id,
        row.company_name,
        row.contact_name,
        row.email,
        row.phone,
        row.status,
        row.value,
        row.created_at ? new Date(row.created_at).toISOString() : ""
      ];
      csvRows.push(lineValues.map(escapeCsvValue).join(","));
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `leads-${timestamp}.csv`;
    const csvContent = `\uFEFF${csvRows.join("\r\n")}`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return next(error);
  }
});

leadsRouter.post("/", async (req, res, next) => {
  try {
    const input = leadSchema.parse(req.body);
    const createdLead = await query(
      `
      INSERT INTO leads (owner_id, company_name, contact_name, email, phone, status, value)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, company_name, contact_name, email, phone, status, value, created_at
      `,
      [
        req.user.id,
        input.companyName,
        input.contactName,
        input.email || null,
        input.phone || null,
        input.status,
        input.value
      ]
    );

    const lead = createdLead.rows[0];

    return res.status(201).json(mapLeadRow(lead));
  } catch (error) {
    return next(error);
  }
});

leadsRouter.post("/seed-demo", async (req, res, next) => {
  try {
    const input = seedDemoSchema.parse(req.body ?? {});
    const insertedLeads = await seedDemoLeadsForUser(req.user.id, {
      clearExisting: input.replace
    });

    return res.status(201).json({
      message: "Demo leads inserted",
      count: insertedLeads.length,
      leads: insertedLeads
    });
  } catch (error) {
    return next(error);
  }
});

leadsRouter.put("/:id", async (req, res, next) => {
  try {
    const leadId = parseLeadId(req.params.id);
    if (!leadId) {
      return res.status(400).json({ message: "Invalid lead id" });
    }

    const input = leadSchema.parse(req.body);
    const updatedLead = await query(
      `
      UPDATE leads
      SET
        company_name = $1,
        contact_name = $2,
        email = $3,
        phone = $4,
        status = $5,
        value = $6,
        updated_at = NOW()
      WHERE id = $7 AND owner_id = $8
      RETURNING id, company_name, contact_name, email, phone, status, value, created_at
      `,
      [
        input.companyName,
        input.contactName,
        input.email || null,
        input.phone || null,
        input.status,
        input.value,
        leadId,
        req.user.id
      ]
    );

    if (updatedLead.rowCount === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(mapLeadRow(updatedLead.rows[0]));
  } catch (error) {
    return next(error);
  }
});

leadsRouter.delete("/:id", async (req, res, next) => {
  try {
    const leadId = parseLeadId(req.params.id);
    if (!leadId) {
      return res.status(400).json({ message: "Invalid lead id" });
    }

    const deletedLead = await query(
      `
      DELETE FROM leads
      WHERE id = $1 AND owner_id = $2
      RETURNING id
      `,
      [leadId, req.user.id]
    );

    if (deletedLead.rowCount === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

leadsRouter.patch("/:id/status", async (req, res, next) => {
  try {
    const leadId = parseLeadId(req.params.id);
    if (!leadId) {
      return res.status(400).json({ message: "Invalid lead id" });
    }

    const input = updateStatusSchema.parse(req.body);
    const updatedLead = await query(
      `
      UPDATE leads
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND owner_id = $3
      RETURNING id, status
      `,
      [input.status, leadId, req.user.id]
    );

    if (updatedLead.rowCount === 0) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json(updatedLead.rows[0]);
  } catch (error) {
    return next(error);
  }
});
