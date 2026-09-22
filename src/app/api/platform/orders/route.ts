import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { listOrdersScoped, createOrder } from '@/lib/repos/orders';
import { errorResponse, ok } from '@/lib/api-helpers';
import type { OrderStatus } from '@/types/platform';

export const dynamic = 'force-dynamic';

// GET — ownership-scoped list (provider/fulfiller/customer/admin). Guests get nothing.
export async function GET(req: NextRequest) {
  try {
    const actor = await getActor();
    const status = req.nextUrl.searchParams.get('status') as OrderStatus | null;
    return ok(await listOrdersScoped(actor, { status: status ?? undefined }));
  } catch (err) { return errorResponse(err); }
}

// POST — public checkout. Prices are computed server-side from published SKUs.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await createOrder({
      storefrontId: body.storefront_id,
      items: body.items,
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      special_instructions: body.special_instructions,
    });
    // Return the access token once so the guest can track without an account.
    return ok({ id: order.id, order_number: order.order_number, total: order.total,
      currency: order.currency, access_token: order.access_token, status: order.status }, 201);
  } catch (err) { return errorResponse(err); }
}
