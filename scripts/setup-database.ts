import { initializeDatabase } from "../lib/database"

async function setupDatabase() {
  try {
    console.log("🔄 Initializing database...")
    await initializeDatabase()
    console.log("✅ Database initialized successfully!")

    console.log("\n📊 Database tables created:")
    console.log("- users (employees)")
    console.log("- attendance (check-in/out records)")

    console.log("\n🚀 You can now start the application with: npm run dev")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
