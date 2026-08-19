const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const adbArgs = process.argv.slice(2);

if (!adbArgs.length) {
  console.error("Usage: node scripts/android-adb.cjs <adb-args>");
  process.exit(1);
}

const env = { ...process.env };
let command = "adb";

if (process.platform === "win32") {
  const androidSdk = path.join(env.LOCALAPPDATA || "", "Android", "Sdk");
  const adbPath = path.join(androidSdk, "platform-tools", "adb.exe");
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") || "Path";

  if (!env.ANDROID_HOME && fs.existsSync(androidSdk)) {
    env.ANDROID_HOME = androidSdk;
  }

  if (!env.ANDROID_SDK_ROOT && env.ANDROID_HOME) {
    env.ANDROID_SDK_ROOT = env.ANDROID_HOME;
  }

  if (fs.existsSync(adbPath)) {
    command = adbPath;
  } else if (env.ANDROID_HOME) {
    env[pathKey] = [path.join(env.ANDROID_HOME, "platform-tools"), env[pathKey] || ""]
      .join(path.delimiter);
  }
}

const result = spawnSync(command, adbArgs, {
  env,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
