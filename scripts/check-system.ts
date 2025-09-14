import { execSync } from "child_process"
import { existsSync } from "fs"

async function checkSystem() {
  console.log("🔍 Checking system requirements...\n")

  // Check Node.js version
  const nodeVersion = process.version
  console.log(`✅ Node.js: ${nodeVersion}`)

  // Check if database exists
  const dbExists = existsSync("./attendance.db")
  console.log(`${dbExists ? "✅" : "⚠️"} Database: ${dbExists ? "Found" : "Not found (will be created)"}`)

  // Check dependencies
  try {
    execSync("npm list --depth=0", { stdio: "ignore" })
    console.log("✅ Dependencies: All installed")
  } catch {
    console.log('⚠️ Dependencies: Some missing, run "npm install"')
  }

  // Check ports
  try {
    const { createServer } = await import("http")
    const server = createServer()
    server.listen(3000, () => {
      console.log("✅ Port 3000: Available")
      server.close()
    })
  } catch {
    console.log("⚠️ Port 3000: May be in use")
  }

  console.log("\n🚀 System check complete!")
  console.log('Run "npm run setup" to initialize database')
  console.log('Run "npm run dev" to start development server')
}

checkSystem().catch(console.error)
