import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
  console.error("❌ CRON_SECRET tidak ditemukan di .env");
  process.exit(1);
}

console.log("⏰ InsightIQ Cron Scheduler mulai berjalan...");
console.log(`   Target: ${APP_URL}/api/cron/daily-notifications`);
console.log("   Jadwal: setiap menit\n");

cron.schedule("* * * * *", async () => {
  const timestamp = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  });

  try {
    const res = await fetch(`${APP_URL}/api/cron/daily-notifications`, {
      headers: { "x-cron-secret": CRON_SECRET! },
    });
    const data = await res.json();

    if (data.sent > 0 || data.errors?.length) {
      console.log(`[CRON] ${timestamp} — Terkirim: ${data.sent}, Skip: ${data.skipped}`);
      if (data.errors?.length) {
        console.error("[CRON] Errors:", data.errors);
      }
    }
  } catch (err: any) {
    console.error(`[CRON] ${timestamp} — Error:`, err.message);
  }
});

process.on("SIGINT", () => {
  console.log("\n🛑 Cron scheduler dihentikan.");
  process.exit(0);
});
