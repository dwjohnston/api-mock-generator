/**
 * Fully generated using Copilot
 */

const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const scenario = process.argv[2];

if (!scenario) {
  console.error('Please provide a scenario name.');
  process.exit(1);
}

const sourceDir = path.join('testlogs/_fixed');
const destDir = path.join('preservedLogs', scenario);

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory "${sourceDir}" does not exist.`);
  process.exit(1);
}

exec(`cp -r ${sourceDir} ${destDir}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error copying logs: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error: ${stderr}`);
    return;
  }
  console.log(`Logs copied to ${destDir}`);
});