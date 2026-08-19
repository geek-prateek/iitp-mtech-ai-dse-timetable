const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const androidAssets = path.join(rootDir, "android", "app", "src", "main", "assets", "www");

const files = [
  ["index.html", "index.html"],
  [path.join("css", "style.css"), path.join("css", "style.css")],
  [path.join("js", "app.js"), path.join("js", "app.js")],
  [path.join("js", "courses.js"), path.join("js", "courses.js")],
  [path.join("assets", "iitp-seal.png"), path.join("assets", "iitp-seal.png")],
  [path.join("assets", "cet-logo.png"), path.join("assets", "cet-logo.png")]
];

for (const [source, destination] of files) {
  const sourcePath = path.join(rootDir, source);
  const destinationPath = path.join(androidAssets, destination);

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
}

const androidIndexPath = path.join(androidAssets, "index.html");
const androidIndex = fs.readFileSync(androidIndexPath, "utf8")
  .replace("<strong>NGVP</strong> &middot;", "Made with &hearts; by Raj Kisan |");
fs.writeFileSync(androidIndexPath, androidIndex);

console.log(`Synced ${files.length} web assets to ${path.relative(rootDir, androidAssets)}.`);
