
import { db, setupTables } from "../lib/database";
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database tables...");
    // Call the setup function to create users and attendance tables
    setupTables();
    console.log("✅ Users and attendance tables are ready.");

    // Create admins table
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    console.log("- Admins table created.");

    // Create a default admin user
    const adminUsername = 'admin';
    const adminPassword = 'password';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const stmt = db.prepare('INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)');
    stmt.run(adminUsername, hashedPassword);
    console.log(`- Default admin user '${adminUsername}' created with password '${adminPassword}'.`);


    console.log("\n📊 All database tables are set up:");
    console.log("- users (employees)");
    console.log("- attendance (check-in/out records)");
    console.log("- admins");


    console.log("\n🚀 You can now start the application with: npm run dev");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
