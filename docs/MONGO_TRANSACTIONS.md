# Enable MongoDB transactions (single-node replica set)

## Why

MongoDB only supports **transactions on a replica set**. On a standalone
`mongod`, checkout cannot write *"order paid"* and *"stock decremented"* in one
atomic step — a crash between the two leaves a **paid order with stock never
taken off**, and your inventory silently drifts.

The app already handles this safely: it detects a standalone at runtime, logs a
warning, and runs the same code **without** a transaction. So nothing is broken
today. But before you take real money, turn this on.

This is a **single-node** replica set — the *same one machine*, same
performance, same data. It only turns on the transaction machinery.

You can see the current state on the admin dashboard: the **"DB transactions"**
pill and the amber banner.

---

## On the server (Ubuntu)

```bash
# 1. Tell mongod it belongs to a replica set
sudo tee -a /etc/mongod.conf >/dev/null <<'EOF'

replication:
  replSetName: rs0
EOF

# 2. Restart mongod
sudo systemctl restart mongod

# 3. Initiate the set (only ever needs doing once)
mongosh --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "127.0.0.1:27017"}]})'

# 4. Confirm — should print: rs0
mongosh --quiet --eval 'db.hello().setName'
```

Then restart the app:

```bash
pm2 restart stagfencing
```

The dashboard pill flips to **connected** and the amber warning disappears.

> **The connection string does not change.** Keep
> `MONGODB_URI=mongodb://127.0.0.1:27017/stagfencing` — the driver discovers the
> replica set on its own.

---

## Locally (Windows)

1. Open `mongod.cfg` (usually `C:\Program Files\MongoDB\Server\<ver>\bin\mongod.cfg`)
   as Administrator and add:

   ```yaml
   replication:
     replSetName: rs0
   ```

2. Restart the MongoDB service:

   ```powershell
   Restart-Service MongoDB
   ```

3. Initiate once:

   ```powershell
   mongosh --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "127.0.0.1:27017"}]})'
   ```

4. Verify:

   ```powershell
   mongosh --quiet --eval 'db.hello().setName'   # -> rs0
   ```

---

## What you get once it's on

| Operation | Becomes atomic |
|---|---|
| Stripe webhook marks an order paid | payment status **+** stock decrement |
| Non-Stripe checkout | order creation **+** stock reservation (rolls back if stock ran out) |
| Cancelling a paid order | status change **+** stock returned |

Overselling is *already* prevented by a conditional update
(`{ stock: { $gte: qty } }` → `$inc: -qty`), which is race-safe with or without
transactions. Transactions close the remaining gap: a **crash halfway through**.
