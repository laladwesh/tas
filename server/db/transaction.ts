import mongoose, { type ClientSession } from "mongoose";
import { connectDB } from "@/server/db/mongoose";

/* ===========================================================================
   Transactions.

   MongoDB only supports transactions on a REPLICA SET. A standalone `mongod`
   throws "Transaction numbers are only allowed on a replica set member".

   So we detect support once and degrade gracefully: with a replica set you get
   real atomicity; on a standalone the same code still runs, just without the
   transaction. That means the app works today and gets safer the moment you
   run rs.initiate() — no code change.
   =========================================================================== */

let supportsTransactions: boolean | null = null;

async function detectSupport() {
  if (supportsTransactions !== null) return supportsTransactions;

  await connectDB();
  try {
    const admin = mongoose.connection.db?.admin();
    const info = await admin?.command({ hello: 1 });
    // `setName` is only present when the node belongs to a replica set.
    supportsTransactions = Boolean(info?.setName);
  } catch {
    supportsTransactions = false;
  }

  if (!supportsTransactions) {
    console.warn(
      "[db] Mongo is running standalone — transactions are DISABLED. " +
        "Run rs.initiate() to turn it into a single-node replica set."
    );
  }

  return supportsTransactions;
}

/**
 * Runs `fn` inside a transaction when the server supports one.
 * `fn` receives the session (or undefined on a standalone) and must pass it to
 * every query it makes, otherwise that query won't be part of the transaction.
 */
export async function withTransaction<T>(
  fn: (session: ClientSession | undefined) => Promise<T>
): Promise<T> {
  await connectDB();

  if (!(await detectSupport())) {
    return fn(undefined);
  }

  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    // withTransaction resolves only after the callback succeeded.
    return result!;
  } finally {
    await session.endSession();
  }
}

/** Exposed so the admin dashboard can warn when transactions are off. */
export async function transactionsEnabled() {
  return detectSupport();
}
