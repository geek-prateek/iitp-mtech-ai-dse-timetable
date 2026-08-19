const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const gradleArgs = process.argv.slice(2);
const task = gradleArgs[0];

if (!task) {
  console.error("Usage: node scripts/android-gradle.cjs <gradle-task>");
  process.exit(1);
}

const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const wrapper = process.platform === "win32" ? "gradlew.bat" : "gradlew";
const wrapperPath = path.join(androidDir, wrapper);
const hasWrapper = fs.existsSync(wrapperPath);
let command = hasWrapper ? wrapperPath : "gradle";
let args = [...gradleArgs];
const env = { ...process.env };

if (process.platform === "win32") {
  const androidStudioJdk = "C:\\Program Files\\Android\\Android Studio\\jbr";
  const androidSdk = path.join(env.LOCALAPPDATA || "", "Android", "Sdk");
  const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") || "Path";

  if (!env.JAVA_HOME && fs.existsSync(path.join(androidStudioJdk, "bin", "java.exe"))) {
    env.JAVA_HOME = androidStudioJdk;
  }

  if (!env.ANDROID_HOME && fs.existsSync(androidSdk)) {
    env.ANDROID_HOME = androidSdk;
  }

  if (!env.ANDROID_SDK_ROOT && env.ANDROID_HOME) {
    env.ANDROID_SDK_ROOT = env.ANDROID_HOME;
  }

  const pathEntries = [];
  if (env.JAVA_HOME) pathEntries.push(path.join(env.JAVA_HOME, "bin"));
  if (env.ANDROID_HOME) {
    pathEntries.push(path.join(env.ANDROID_HOME, "platform-tools"));
    pathEntries.push(path.join(env.ANDROID_HOME, "emulator"));
  }
  env[pathKey] = [...pathEntries, env[pathKey] || ""].join(path.delimiter);
}

if (process.platform === "win32" && hasWrapper) {
  command = env.ComSpec || path.join(env.SystemRoot || "C:\\Windows", "System32", "cmd.exe");
  args = ["/d", "/s", "/c", "call", wrapperPath, ...args];
}

if (!gradleArgs.includes("--no-problems-report")) {
  args.push("--no-problems-report");
}

const result = spawnSync(command, args, {
  cwd: androidDir,
  env,
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
}

if (result.status !== 0) {
  if (!fs.existsSync(wrapperPath)) {
    console.error(
      "\nGradle was not found. Install Gradle, or open android/ in Android Studio and add a Gradle wrapper."
    );
  }
  process.exit(result.status || 1);
}
