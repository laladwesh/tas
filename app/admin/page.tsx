import Link from "next/link";

import { countLeads, listLeads } from "@/server/services/leads";
import { countOrders, listOrders } from "@/server/services/orders";
import {
  listAllServices,
  listAllFaqs,
  listAllHeroImages,
  listAllProducts,
  listAllArticles,
  listAllProjects,
} from "@/server/services/adminContent";
import { Card, PageHeader } from "@/app/admin/_components/ui";
import { formatCents } from "@/lib/money";
import { S3_ENABLED } from "@/server/services/storage";
import { STRIPE_ENABLED } from "@/server/services/stripe";
import { transactionsEnabled } from "@/server/db/transaction";

export default async function AdminDashboard() {
  const [
    leadCounts,
    orderCounts,
    services,
    faqs,
    hero,
    products,
    articles,
    projects,
    recentLeads,
    recentOrders,
    txEnabled,
  ] = await Promise.all([
    countLeads(),
    countOrders(),
    listAllServices(),
    listAllFaqs(),
    listAllHeroImages(),
    listAllProducts(),
    listAllArticles(),
    listAllProjects(),
    listLeads(),
    listOrders(),
    transactionsEnabled(),
  ]);

  const stats = [
    { label: "New leads", value: leadCounts.fresh, href: "/admin/leads", accent: true },
    { label: "Unpaid orders", value: orderCounts.unpaid, href: "/admin/orders", accent: true },
    { label: "Paid revenue", value: formatCents(orderCounts.revenueCents), href: "/admin/orders" },
    { label: "Orders", value: orderCounts.total, href: "/admin/orders" },
    { label: "Products", value: products.length, href: "/admin/products" },
    { label: "Services", value: services.length, href: "/admin/services" },
    { label: "Articles", value: articles.length, href: "/admin/articles" },
    { label: "Gallery", value: projects.length, href: "/admin/projects" },
    { label: "Hero slides", value: hero.length, href: "/admin/hero" },
    { label: "FAQs", value: faqs.length, href: "/admin/faqs" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Everything on the site is editable from here."
      />

      {/* Integration status — makes missing config obvious instead of silent */}
      <div className="mb-4 flex flex-wrap gap-2">
        <StatusPill label="Stripe payments" on={STRIPE_ENABLED} />
        <StatusPill label="S3 image uploads" on={S3_ENABLED} />
        <StatusPill label="DB transactions" on={txEnabled} />
      </div>

      {!txEnabled && (
        <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">
            MongoDB is running standalone — transactions are off.
          </p>
          <p className="mt-1 text-amber-800">
            Orders still work, but payment and stock aren&rsquo;t written
            atomically, so a crash mid-checkout could leave a paid order with
            stock not decremented. Convert Mongo to a single-node replica set
            (same machine, same speed) to fix it — see{" "}
            <code className="rounded bg-amber-100 px-1">DEPLOY.md</code>.
          </p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-sm border border-gray-200 bg-white p-4 transition hover:border-brand/40"
          >
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p
              className={`mt-1 text-2xl font-bold ${
                s.accent && s.value ? "text-brand" : "text-gray-900"
              }`}
            >
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent orders">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentOrders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-500">{order.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCents(order.totalCents)}
                    </p>
                    <p
                      className={`text-xs ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : "text-brand"
                      }`}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent enquiries">
          {recentLeads.length === 0 ? (
            <p className="text-sm text-gray-500">No leads yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentLeads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs capitalize text-gray-600">{lead.status}</p>
                    {!lead.emailed && (
                      <p className="text-xs text-brand" title={lead.emailError}>
                        email failed
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function StatusPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        on
          ? "border-green-600/30 bg-green-50 text-green-700"
          : "border-gray-300 bg-gray-50 text-gray-500"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${on ? "bg-green-600" : "bg-gray-400"}`}
      />
      {label}: {on ? "connected" : "not configured"}
    </span>
  );
}
