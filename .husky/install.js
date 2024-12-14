// .husky/install.js (注意 ts 项目会 ignore 所有 .js 的问题)
const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");

if (fs.existsSync(path.resolve(__dirname, ".git"))) {
  spawn.sync("npx", ["husky", "install"], { stdio: "inherit" });
}
