const { spawnSync } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nodeCommand = process.execPath;

function runStep(label, args, options = {}) {
  console.log(`\n${label}`);
  const result = spawnSync(nodeCommand, args, {
    cwd: rootDir,
    stdio: "inherit",
    ...options
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  return result.status === null ? 1 : result.status;
}

runStep("Uninstalling existing app if present...", [
  "scripts/android-adb.cjs",
  "uninstall",
  "com.iitp.aidsetimetable"
]);

const syncStatus = runStep("Syncing Android assets...", [
  "scripts/sync-android-assets.cjs"
]);

if (syncStatus !== 0) {
  process.exit(syncStatus);
}

const installStatus = runStep("Installing debug app...", [
  "scripts/android-gradle.cjs",
  "installDebug"
]);

process.exit(installStatus);
