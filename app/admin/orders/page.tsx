import { listOrders } from "@/server/services/orders";
import {
  updateOrderStatus,
  markOrderPaidManually,
} from "@/app/admin/_actions/catalog";
import {
  Banner,
  Card,
  GhostButton,
  PageHeader,
  PrimaryButton,
  inputClass,
} from "@/app/admin/_components/ui";
import { formatCents } from "@/lib/money";

const STATUSES = ["pending", "paid", "processing", "fulfilled", "cancelled"] as const;

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const orders = await listOrders();

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every shop order. Stripe payments flip to paid automatically via webhook."
      />
      <Banner ok={ok} error={error} />

      <Card title={`Orders (${orders.length})`}>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="rounded-sm border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.orderNumber}{" "}
                      <span className="ml-1 font-normal text-gray-500">
                        · {order.name}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${order.email}`} className="text-brand underline">
                        {order.email}
                      </a>
                      {order.phone && <> · {order.phone}</>}
                    </p>
                    {order.address && (
                      <p className="mt-0.5 text-sm text-gray-500">{order.address}</p>
                    )}
                    <p className="mt-0.5 text-xs capitalize text-gray-500">
                      {order.fulfilment}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCents(order.totalCents)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-brand"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Line items */}
                <ul className="mt-3 space-y-1 rounded-sm bg-gray-50 p-3">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between text-xs text-gray-700"
                    >
                      <span>
                        {item.quantity} × {item.title}
                      </span>
                      <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
                    </li>
                  ))}
                  {order.shippingCents > 0 && (
                    <li className="flex justify-between border-t border-gray-200 pt-1 text-xs text-gray-500">
                      <span>Delivery</span>
                      <span>{formatCents(order.shippingCents)}</span>
                    </li>
                  )}
                </ul>

                {order.stockIssue && (
                  <p className="mt-2 rounded-sm border border-brand/40 bg-brand/5 p-3 text-xs font-medium text-brand">
                    ⚠ Oversold — paid but not enough stock: {order.stockNote}
                  </p>
                )}

                {order.notes && (
                  <p className="mt-2 whitespace-pre-line rounded-sm bg-gray-50 p-3 text-sm text-gray-700">
                    {order.notes}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                  <form action={updateOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className={`${inputClass} w-36`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <GhostButton type="submit">Update</GhostButton>
                  </form>

                  {order.paymentStatus !== "paid" && (
                    <form action={markOrderPaidManually}>
                      <input type="hidden" name="id" value={order.id} />
                      <PrimaryButton type="submit">
                        Mark paid (bank/cash)
                      </PrimaryButton>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
