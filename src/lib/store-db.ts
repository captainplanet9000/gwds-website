import { createServerClient } from '@/lib/supabase';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses?: number | null;
  used_count: number;
  min_order: number;
  applies_to?: string[] | null;
  excludes?: string[] | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function database() {
  return createServerClient();
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await database()
    .from('gwds_coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as Coupon[];
}

export async function getCoupon(id: string): Promise<Coupon | null> {
  const { data, error } = await database()
    .from('gwds_coupons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Coupon | null;
}

export async function createCoupon(
  coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>,
): Promise<Coupon> {
  const row = { ...coupon, code: coupon.code.toUpperCase(), used_count: 0 };
  const { data, error } = await database().from('gwds_coupons').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data as Coupon;
}

export async function updateCoupon(id: string, update: Partial<Coupon>): Promise<Coupon | null> {
  const patch = {
    ...update,
    ...(update.code ? { code: update.code.toUpperCase() } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await database()
    .from('gwds_coupons')
    .update(patch)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Coupon | null;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const { data, error } = await database()
    .from('gwds_coupons')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
