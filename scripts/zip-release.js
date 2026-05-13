import { createWriteStream, readdirSync, statSync } from "fs";
import { join } from "path";

// Simple ZIP creation without external dependency for now
import { execSync } from "child_process";

const version = process.env.npm_package_version || "0.1.0";
const outputDir = "release";
const distDir = "dist";

try {
  execSync(`mkdir -p ${outputDir}`);
  execSync(`cd ${distDir} && zip -r ../${outputDir}/ai-startpage-cws-v${version}.zip .`);
  console.log(`✅ Release ZIP created: ${outputDir}/ai-startpage-cws-v${version}.zip`);
} catch (err) {
  console.error("❌ Failed to create ZIP:", err);
  process.exit(1);
}
