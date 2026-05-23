import "dotenv/config";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI!;

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("InsightIQ");
    const users = db.collection("users");

    await users.deleteMany({
      email: { $in: ["demo@insightiq.com", "admin@insightiq.com"] },
    });

    const hashedDemoPassword = await bcrypt.hash("demo123", 10);
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);

    await users.insertMany([
      {
        name: "Demo User",
        email: "demo@insightiq.com",
        password: hashedDemoPassword,
        role: "user",
        createdAt: new Date(),
      },
      {
        name: "Admin InsightIQ",
        email: "admin@insightiq.com",
        password: hashedAdminPassword,
        role: "admin",
        createdAt: new Date(),
      },
    ]);

    console.log("Seed berhasil! 2 user dibuat:");
    console.log("   - demo@insightiq.com / demo123");
    console.log("   - admin@insightiq.com / admin123");
  } catch (error) {
    console.error("Seed gagal:", error);
  } finally {
    await client.close();
  }
}

seed();
