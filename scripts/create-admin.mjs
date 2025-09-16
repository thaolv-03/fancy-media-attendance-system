// scripts/create-admin.mjs
// THIS IS A TEMPORARY SCRIPT FOR ONE-TIME SETUP.

import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

// --- Configuration ---
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

// --- Database Connection ---
const dbPath = path.join(process.cwd(), "attendance.db");
let db;
try {
  db = new Database(dbPath);
  console.log(`[INFO] Successfully connected to database: ${dbPath}`);
} catch (error) {
  console.error(`[ERROR] Failed to connect to the database at ${dbPath}`);
  console.error(error.message);
  process.exit(1);
}

// --- Main Logic ---
async function setupAdmin() {
  try {
    // 1. Create admins table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
      )
    `);
    console.log('[INFO] Table "admins" is ready.');

    // 2. Hash the password
    console.log(`[INFO] Hashing the default password...`);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, saltRounds);

    // 3. Insert the user if they don't exist, then forcefully update their password.
    // This ensures we have a user and they always have the correct, latest password from this script.
    const insertStmt = db.prepare(
      "INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)"
    );
    insertStmt.run(DEFAULT_USERNAME, "temporary_password"); // A placeholder that will be updated immediately

    const updateStmt = db.prepare(
      "UPDATE admins SET password = ? WHERE username = ?"
    );
    updateStmt.run(hashedPassword, DEFAULT_USERNAME);

    console.log(`\n✅ --- SUCCESS --- ✅`);
    console.log(`Admin user '${DEFAULT_USERNAME}' has been created/updated.`);
    console.log(`You can now log in with:`);
    console.log(`   Username: ${DEFAULT_USERNAME}`);
    console.log(`   Password: ${DEFAULT_PASSWORD}`);
    console.log(
      `\n[SECURITY WARNING] This script contains a hardcoded password.`
    );
  } catch (error) {
    console.error("❌ [ERROR] An error occurred during admin setup:", error);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
      console.log("[INFO] Database connection closed.");
    }
  }
}

// --- Run the setup ---
setupAdmin();
