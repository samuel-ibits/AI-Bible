const path = require("path");
const { spawn } = require("child_process");
const os = require("os");

const isWindows = os.platform() === "win32";
const pythonPath = isWindows
  ? path.join("venv", "Scripts", "python.exe")
  : path.join("venv", "bin", "python");

const scriptPath = path.join("src", "python", "app.py");

console.log("🚀 Starting Python process...");

const pyProcess = spawn(pythonPath, [scriptPath], {
  stdio: "inherit",
});

pyProcess.on("error", (err) => {
  console.error("❌ Failed to start Python process:", err);
});

pyProcess.on("close", (code) => {
  console.log(`🐍 Python script exited with code ${code}`);
});
pyProcess.on("exit", (code) => {
  console.log(`🐍 Python script exited with code ${code}`);
  if (code !== 0) {
    console.error("❌ Python script encountered an error.");
  }
});