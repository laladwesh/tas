import "server-only";

import type { ClientSession } from "mongoose";

import { connectDB } from "@/server/db/mongoose";
import { Product } from "@/server/models";

export type StockLine = { productSlug: string; title: string; quantity: number };

/**
 * Reserve (decrement) stock for the given lines.
 *
 * The decrement is a single CONDITIONAL update per product:
 *
 *   { slug, trackStock: true, stock: { $gte: qty } }  ->  $inc: { stock: -qty }
 *
 * The `$gte` guard is what makes it race-safe. Two shoppers buying the last
 * item can't both succeed: Mongo matches the document only if the stock is
 * still there, so the second update matches nothing.
 *
 * Products with trackStock off are unlimited and skipped.
 *
 * Returns the lines it could NOT fully reserve (empty array = all good).
 */
export async function reserveStock(
  lines: StockLine[],
  session?: ClientSession
): Promise<string[]> {
  await connectDB();
  const shortfalls: string[] = [];

  for (const line of lines) {
    const result = await Product.updateOne(
      {
        slug: line.productSlug,
        trackStock: true,
        stock: { $gte: line.quantity },
      },
      { $inc: { stock: -line.quantity } },
      { session }
    );

    if (result.matchedCount === 0) {
      // Either the product isn't tracked (fine) or there isn't enough stock.
      const product = await Product.findOne({ slug: line.productSlug })
        .session(session ?? null)
        .lean();

      if (product?.trackStock) {
        shortfalls.push(
          `${line.title} (wanted ${line.quantity}, ${product.stock ?? 0} left)`
        );
      }
    }
  }

  return shortfalls;
}

/** Put stock back — used when an order is cancelled. */
export async function releaseStock(
  lines: StockLine[],
  session?: ClientSession
) {
  await connectDB();

  for (const line of lines) {
    await Product.updateOne(
      { slug: line.productSlug, trackStock: true },
      { $inc: { stock: line.quantity } },
      { session }
    );
  }
}

/** Read-only pre-check, so we can show a friendly error before taking money. */
export async function checkAvailability(lines: StockLine[]): Promise<string[]> {
  await connectDB();
  const problems: string[] = [];

  for (const line of lines) {
    const product = await Product.findOne({ slug: line.productSlug }).lean();
    if (!product?.trackStock) continue;

    if ((product.stock ?? 0) < line.quantity) {
      problems.push(
        `${line.title} — only ${product.stock ?? 0} left (you asked for ${line.quantity})`
      );
    }
  }

  return problems;
}
