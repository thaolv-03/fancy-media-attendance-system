import Database from "better-sqlite3"
import path from "path"
import type { AttendanceRecord, User } from "./types";

const dbPath = path.join(process.cwd(), "attendance.db")
console.log("Database path:", dbPath);
const db = new Database(dbPath)

const toSqliteTimestamp = (date: Date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      embedding TEXT NOT NULL,
      qr_code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%S', 'now'))
    )
  `)
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      method TEXT NOT NULL,
      check_type TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance(timestamp);`)
}

// User operations
export function addUser(name: string, embedding: number[], qrCode: string) {
  const stmt = db.prepare(`INSERT INTO users (name, embedding, qr_code) VALUES (?, ?, ?)`)
  return stmt.run(name, JSON.stringify(embedding), qrCode)
}

export function getUsers(): User[] {
  const stmt = db.prepare(`SELECT id, name, qr_code, created_at FROM users ORDER BY id ASC`)
  return stmt.all() as User[];
}

export function getUsersWithEmbeddings() {
  const stmt = db.prepare(`SELECT id, name, embedding FROM users`)
  const users = stmt.all() as any[]
  return users.map((user) => ({ ...user, embedding: JSON.parse(user.embedding) }))
}

export function getUserById(id: number): User {
  const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`)
  return stmt.get(id) as User;
}

export function deleteUser(id: number) {
  const transaction = db.transaction((userId: number) => {
    db.prepare('DELETE FROM attendance WHERE user_id = ?').run(userId);
    return db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  });
  return transaction(id);
}

// Attendance operations
export function addAttendance(userId: number, method: string, checkType: string, status: string, timestamp: Date) {
  const stmt = db.prepare(`INSERT INTO attendance (user_id, method, check_type, status, timestamp) VALUES (?, ?, ?, ?, ?)`)
  const sqliteTimestamp = toSqliteTimestamp(timestamp);
  return stmt.run(userId, method, checkType, status, sqliteTimestamp)
}

export function getAttendanceRecords(limit = 100): AttendanceRecord[] {
  const stmt = db.prepare(`
    SELECT a.id, a.user_id, u.name as user_name, a.method, a.check_type, a.status, a.timestamp
    FROM attendance a JOIN users u ON a.user_id = u.id
    ORDER BY a.timestamp DESC LIMIT ?
  `)
  return stmt.all(limit) as AttendanceRecord[];
}

// --- NEW, SIMPLIFIED SHIFT & STATUS LOGIC ---

export function getCurrentShiftWindow(now: Date) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 100 + minutes;

  // Shift 1 (Morning): 7:00 AM to 12:45 PM
  if (time >= 700 && time < 1245) {
    return { shift: "shift1", name: "buổi sáng" };
  }

  // Shift 2 (Afternoon): 12:45 PM to 6:00 PM (18:00)
  if (time >= 1245 && time < 1800) {
    return { shift: "shift2", name: "buổi chiều" };
  }

  // No active shift found
  return null;
}

export function decideActionAndStatus(userId: number, now: Date) {
  const shift = getCurrentShiftWindow(now);

  // Case 1: Outside of any working hours
  if (!shift) {
    return { action: "Check-in", status: "Ngoài giờ" };
  }

  // Define the date range for today (in local time)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch today's records for the user. We convert the local time range to UTC for the query.
  const stmt = db.prepare(`
    SELECT check_type, timestamp FROM attendance
    WHERE user_id = ? AND timestamp BETWEEN ? AND ?
  `);
  const recordsToday = stmt.all(
    userId,
    toSqliteTimestamp(todayStart),
    toSqliteTimestamp(todayEnd)
  ) as { check_type: string; timestamp: string }[];

  // Filter records that fall within the current shift's time window
  const shiftRecords = recordsToday.filter(rec => {
    const recDate = new Date(rec.timestamp + 'Z'); // Interpret DB time as UTC
    const shiftWindow = getCurrentShiftWindow(recDate);
    return shiftWindow?.shift === shift.shift;
  });

  const hasCheckIn = shiftRecords.some(r => r.check_type === 'Check-in');
  const hasCheckOut = shiftRecords.some(r => r.check_type === 'Check-out');

  // Case 2: Already fully checked in and out for this shift
  if (hasCheckIn && hasCheckOut) {
    return { action: null, status: `Đã hoàn thành chấm công ${shift.name}` };
  }

  const time = now.getHours() * 100 + now.getMinutes();

  // Case 3: Need to Check-in
  if (!hasCheckIn) {
    let status = "Đúng giờ";
    if (shift.shift === "shift1" && time > 830) status = "Đi muộn"; // Late after 8:30 AM
    if (shift.shift === "shift2" && time > 1400) status = "Đi muộn"; // Late after 2:00 PM
    return { action: "Check-in", status };
  }

  // Case 4: Need to Check-out
  if (!hasCheckOut) {
    let status = "Đúng giờ";
    if (shift.shift === "shift1" && time < 1130) status = "Về sớm"; // Early before 11:30 AM
    if (shift.shift === "shift2" && time < 1630) status = "Về sớm"; // Early before 4:30 PM
    return { action: "Check-out", status };
  }

  // Fallback case (should not be reached)
  return { action: null, status: "Trạng thái không xác định" };
}

// Initialize database on import
initializeDatabase()

export default db
