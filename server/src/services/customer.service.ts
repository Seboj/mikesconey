import { db } from "../db/index.js";
import { customers } from "../db/schema.js";
import { eq, ilike, or, desc, asc, sql, and, gte } from "drizzle-orm";

export async function createCustomer(data: {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  optInEmail?: boolean;
  optInSms?: boolean;
  source?: string;
}) {
  const [customer] = await db
    .insert(customers)
    .values({
      firstName: data.firstName,
      lastName: data.lastName || "",
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      optInEmail: data.optInEmail ?? true,
      optInSms: data.optInSms ?? false,
      source: data.source || "website",
    })
    .returning();

  return customer;
}

export async function findCustomerByEmail(email: string) {
  const results = await db
    .select()
    .from(customers)
    .where(eq(customers.email, email.toLowerCase()))
    .limit(1);

  return results[0] || null;
}

export async function getCustomerById(id: string) {
  const results = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  return results[0] || null;
}

export async function listCustomers(params: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}) {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 25, 100);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.search) {
    const search = `%${params.search}%`;
    conditions.push(
      or(
        ilike(customers.firstName, search),
        ilike(customers.lastName, search),
        ilike(customers.email, search),
        ilike(customers.phone, search)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumn =
    params.sort === "name"
      ? customers.firstName
      : params.sort === "email"
        ? customers.email
        : customers.createdAt;
  const sortDir = params.order === "asc" ? asc : desc;

  const [data, countResult] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(where)
      .orderBy(sortDir(sortColumn))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(where),
  ]);

  const total = countResult[0].count;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateCustomer(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string | null;
    optInEmail?: boolean;
    optInSms?: boolean;
    notes?: string | null;
  }
) {
  const updates: Record<string, unknown> = { ...data, updatedAt: new Date() };
  if (data.email) updates.email = data.email.toLowerCase();

  const [updated] = await db
    .update(customers)
    .set(updates)
    .where(eq(customers.id, id))
    .returning();

  return updated || null;
}

export async function deleteCustomer(id: string) {
  const [deleted] = await db
    .delete(customers)
    .where(eq(customers.id, id))
    .returning();

  return deleted || null;
}

export async function getDashboardStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [totalResult, weekResult, monthResult, emailResult, smsResult] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(customers),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(gte(customers.createdAt, weekAgo)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(gte(customers.createdAt, monthAgo)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(eq(customers.optInEmail, true)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(eq(customers.optInSms, true)),
    ]);

  return {
    totalCustomers: totalResult[0].count,
    newThisWeek: weekResult[0].count,
    newThisMonth: monthResult[0].count,
    optInEmail: emailResult[0].count,
    optInSms: smsResult[0].count,
  };
}
