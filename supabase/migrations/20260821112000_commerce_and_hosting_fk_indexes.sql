-- Cover customer-commerce and managed-hosting foreign keys used by owner
-- queries, lifecycle joins, and cascading deletes.

create index if not exists admin_members_created_by_idx on public.admin_members(created_by);
create index if not exists data_requests_user_id_idx on public.data_requests(user_id);
create index if not exists downloads_entitlement_id_idx on public.downloads(entitlement_id);
create index if not exists downloads_product_id_idx on public.downloads(product_id);
create index if not exists entitlements_product_id_idx on public.entitlements(product_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);
create index if not exists refund_requests_order_id_idx on public.refund_requests(order_id);
create index if not exists refund_requests_user_id_idx on public.refund_requests(user_id);
create index if not exists support_requests_user_id_idx on public.support_requests(user_id);
create index if not exists hosting_workspace_subscription_id_idx on public.hosting_workspace_state(subscription_id);
