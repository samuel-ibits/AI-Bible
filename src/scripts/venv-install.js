const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");

const isWindows = os.platform() === "win32";
const pipPath = isWindows
  ? path.join("venv", "Scripts", "pip.exe")
  : path.join("venv", "bin", "pip");

const requirementsPath = path.join("src","python", "requirements.txt");

try {
  console.log("📦 Creating virtual environment...");
  execSync("python -m venv venv", { stdio: "inherit" });

  if (!fs.existsSync(pipPath)) {
    console.error("❌ pip not found in venv");
    process.exit(1);
  }

  console.log("📥 Installing Python dependencies...");
  execSync(`"${pipPath}" install -r "${requirementsPath}"`, { stdio: "inherit" });

  console.log("✅ Virtual environment setup complete.");
} catch (err) {
  console.error("❌ Failed to set up virtual environment.");
  console.error(err.message);
  process.exit(1);
}
