import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !serviceKey) return null;
  if (!_supabase) _supabase = createClient(supabaseUrl, serviceKey);
  return _supabase;
}

// Determine if Supabase tables are available
let _useSupabase: boolean | null = null;
async function useSupabase(): Promise<boolean> {
  if (_useSupabase !== null) return _useSupabase;
  const sb = getSupabase();
  if (!sb) { _useSupabase = false; return false; }
  const { error } = await sb.from('orders').select('id').limit(1);
  _useSupabase = !error;
  return _useSupabase;
}

// ─── JSON File Helpers ───
async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(data);
  } catch { return fallback; }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ─── Customer ───
export interface Customer {
  id: string;
  email: string;
  name: string;
  total_spent: number;
  order_count: number;
  created_at: string;
}

export async function getOrCreateCustomer(email: string, name?: string): Promise<Customer> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data: existing } = await sb.from('customers').select('*').eq('email', email).single();
    if (existing) return existing;
    const { data: created } = await sb.from('customers').insert({ email, name: name || '' }).select().single();
    return created!;
  }
  // JSON fallback
  const customers = await readJson<Customer[]>('customers.json', []);
  let customer = customers.find(c => c.email === email);
  if (!customer) {
    customer = { id: crypto.randomUUID(), email, name: name || '', total_spent: 0, order_count: 0, created_at: new Date().toISOString() };
    customers.push(customer);
    await writeJson('customers.json', customers);
  }
  return customer;
}

export async function getAllCustomers(): Promise<Customer[]> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('customers').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  return readJson<Customer[]>('customers.json', []);
}

// ─── Order ───
export interface Order {
  id: string;
  order_id: string;
  customer_id?: string;
  email: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  coupon_code?: string;
  created_at: string;
}

export interface OrderItem {
  product_slug: string;
  product_name: string;
  price: number;
  quantity: number;
}

export async function createOrder(order: Omit<Order, 'id'>): Promise<Order> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data, error } = await sb.from('orders').insert(order).select().single();
    if (error) throw new Error(error.message);
    // Update customer stats
    await sb.rpc('', {}).catch(() => {});
    const { data: cust } = await sb.from('customers').select('*').eq('email', order.email).single();
    if (cust) {
      await sb.from('customers').update({
        total_spent: (cust.total_spent || 0) + order.total,
        order_count: (cust.order_count || 0) + 1,
      }).eq('id', cust.id);
    }
    return data!;
  }
  const orders = await readJson<Order[]>('orders.json', []);
  const full: Order = { ...order, id: crypto.randomUUID() };
  orders.push(full);
  await writeJson('orders.json', orders);
  // Update customer
  const customers = await readJson<Customer[]>('customers.json', []);
  const ci = customers.findIndex(c => c.email === order.email);
  if (ci >= 0) {
    customers[ci].total_spent += order.total;
    customers[ci].order_count += 1;
    await writeJson('customers.json', customers);
  }
  return full;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('orders').select('*').eq('order_id', orderId).single();
    return data;
  }
  const orders = await readJson<Order[]>('orders.json', []);
  return orders.find(o => o.order_id === orderId) || null;
}

export async function updateOrder(orderId: string, update: Partial<Order>): Promise<void> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    await sb.from('orders').update(update).eq('order_id', orderId);
    return;
  }
  const orders = await readJson<Order[]>('orders.json', []);
  const idx = orders.findIndex(o => o.order_id === orderId);
  if (idx >= 0) { orders[idx] = { ...orders[idx], ...update }; await writeJson('orders.json', orders); }
}

export async function getAllOrders(): Promise<Order[]> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  return readJson<Order[]>('orders.json', []);
}

// ─── Download Tokens ───
// Actual Supabase schema: id (uuid), order_id (uuid), product_id (text),
// download_token (uuid), expires_at (timestamptz), downloaded_count (int), max_downloads (int), created_at
export interface DownloadToken {
  id: string;
  order_id: string;
  product_id: string;
  download_token: string;
  downloaded_count: number;
  max_downloads: number;
  downloads_remaining: number; // computed: max_downloads - downloaded_count
  expires_at: string;
  created_at: string;
  // Aliases for backward compat
  token: string;
  product_slug: string;
}

function mapDownload(d: any): DownloadToken {
  const remaining = (d.max_downloads || 5) - (d.downloaded_count || 0);
  return {
    ...d,
    product_id: d.product_id,
    download_token: d.download_token,
    downloaded_count: d.downloaded_count || 0,
    max_downloads: d.max_downloads || 5,
    downloads_remaining: remaining,
    // Aliases
    token: d.download_token,
    product_slug: d.product_id,
  };
}

export async function createDownloadTokens(orderId: string, productSlugs: string[]): Promise<DownloadToken[]> {
  const rows = productSlugs.map(slug => ({
    order_id: orderId,
    product_id: slug,
    download_token: crypto.randomUUID(),
    max_downloads: 5,
    downloaded_count: 0,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('downloads').insert(rows).select();
    return (data || []).map(mapDownload);
  } else {
    const existing = await readJson<any[]>('downloads.json', []);
    const full = rows.map(r => ({ ...r, id: crypto.randomUUID(), created_at: new Date().toISOString() }));
    await writeJson('downloads.json', [...existing, ...full]);
    return full.map(mapDownload);
  }
}

export async function getDownloadToken(token: string): Promise<DownloadToken | null> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('downloads').select('*').eq('download_token', token).single();
    return data ? mapDownload(data) : null;
  }
  const all = await readJson<any[]>('downloads.json', []);
  const found = all.find(d => d.download_token === token);
  return found ? mapDownload(found) : null;
}

export async function getDownloadsByOrder(orderId: string): Promise<DownloadToken[]> {
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('downloads').select('*').eq('order_id', orderId);
    return (data || []).map(mapDownload);
  }
  const all = await readJson<any[]>('downloads.json', []);
  return all.filter(d => d.order_id === orderId).map(mapDownload);
}

export async function consumeDownload(token: string): Promise<boolean> {
  const dl = await getDownloadToken(token);
  if (!dl) return false;
  if (dl.downloads_remaining <= 0) return false;
  if (new Date(dl.expires_at) < new Date()) return false;

  if (await useSupabase()) {
    const sb = getSupabase()!;
    await sb.from('downloads').update({ downloaded_count: dl.downloaded_count + 1 }).eq('download_token', token);
  } else {
    const all = await readJson<any[]>('downloads.json', []);
    const idx = all.findIndex(d => d.download_token === token);
    if (idx >= 0) { all[idx].downloaded_count = (all[idx].downloaded_count || 0) + 1; await writeJson('downloads.json', all); }
  }
  return true;
}

// ─── Coupons ───
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number;
  used_count: number;
  min_order: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }> {
  let coupon: Coupon | null = null;
  if (await useSupabase()) {
    const sb = getSupabase()!;
    const { data } = await sb.from('gwds_coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
    coupon = data;
  } else {
    const all = await readJson<Coupon[]>('coupons.json', []);
    coupon = all.find(c => c.code === code.toUpperCase() && c.is_active) || null;
  }

  if (!coupon) return { valid: false, error: 'Invalid coupon code' };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { valid: false, error: 'Coupon expired' };
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) return { valid: false, error: 'Coupon usage limit reached' };
  if (orderTotal < coupon.min_order) return { valid: false, error: `Minimum order $${coupon.min_order}` };

  const discount = coupon.discount_type === 'percentage'
    ? Math.round(orderTotal * coupon.discount_value / 100 * 100) / 100
    : Math.min(coupon.discount_value, orderTotal);

  return { valid: true, coupon, discount };
}

// ─── Admin Stats ───
export async function getAdminStats() {
  const orders = await getAllOrders();
  const customers = await getAllCustomers();
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = completedOrders.filter(o => o.created_at.startsWith(today));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  
  // Revenue by day (last 30 days)
  const revenueByDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    revenueByDay[d.toISOString().split('T')[0]] = 0;
  }
  completedOrders.forEach(o => {
    const day = o.created_at.split('T')[0];
    if (day in revenueByDay) revenueByDay[day] += o.total;
  });

  return {
    totalRevenue,
    todayRevenue,
    totalOrders: completedOrders.length,
    todayOrders: todayOrders.length,
    totalCustomers: customers.length,
    revenueByDay,
    recentOrders: orders.slice(0, 20),
  };
}

