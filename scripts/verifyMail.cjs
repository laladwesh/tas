// Tests EMAIL_USER / EMAIL_PASS (from .env) against Hostinger's SMTP server.
// Only authenticates (verify) — never sends email.
//   Run:  node scripts/verifyMail.cjs
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

function loadEnv() {
  const file = path.join(__dirname, "..", ".env");
  const env = {};
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const user = env.EMAIL_USER;
const rawPass = env.EMAIL_PASS;
const strippedPass = rawPass.replace(/[-\s]/g, "");

console.log("Testing login for:", user, "\n");

const passVariants = [
  { tag: "as-is", pass: rawPass },
  { tag: "no-dashes", pass: strippedPass },
];
const servers = [
  { host: "smtp.hostinger.com", port: 465, secure: true },
  { host: "smtp.hostinger.com", port: 587, secure: false },
];

(async () => {
  for (const s of servers) {
    for (const v of passVariants) {
      const label = `${s.host}:${s.port}  pass=${v.tag}`;
      try {
        const t = nodemailer.createTransport({
          host: s.host,
          port: s.port,
          secure: s.secure,
          auth: { user, pass: v.pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        });
        await t.verify();
        console.log(`✅ SUCCESS  ${label}   <-- USE THIS`);
      } catch (e) {
        console.log(`❌ FAIL     ${label}   ${(e.response || e.message || "").toString().split("\n")[0]}`);
      }
    }
  }
  process.exit(0);
})();
