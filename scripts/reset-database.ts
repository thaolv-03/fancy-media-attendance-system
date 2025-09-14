import Database from "better-sqlite3"
import path from "path"

const dbPath = path.join(process.cwd(), "attendance.db")
const db = new Database(dbPath)

async function resetDatabase() {
  console.log("🔄 Resetting database to fix embedding length mismatch...")
  
  try {
    // Disable foreign key constraints
    db.exec(`PRAGMA foreign_keys = OFF;`)
    
    // Drop existing tables
    db.exec(`
      DROP TABLE IF EXISTS attendance_records;
      DROP TABLE IF EXISTS users;
    `)
    
    console.log("✅ Dropped existing tables")
    
    // Recreate tables with correct structure
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        embedding TEXT NOT NULL,
        qr_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS attendance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        method TEXT NOT NULL,
        status TEXT DEFAULT 'Đúng giờ',
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `)
    
    // Re-enable foreign key constraints
    db.exec(`PRAGMA foreign_keys = ON;`)
    
    console.log("✅ Recreated tables with correct structure")
    console.log("📝 Database reset complete!")
    console.log("💡 You can now register users again with the new consistent embedding system")
    
  } catch (error) {
    console.error("❌ Error resetting database:", error)
  } finally {
    db.close()
  }
}

resetDatabase().catch(console.error)
