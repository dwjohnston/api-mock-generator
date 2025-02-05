import { stdin } from "node:process";

async function prompt(message) {
  return new Promise((resolve) => {
    console.log(message);
    stdin.once("data", () => resolve());
  });
}

async function main() {
  console.clear();
  await prompt("Press Enter to start recording...");

  console.log("Recording started...");
  await prompt("Press Enter to switch to replay mode...");

  console.log("Switched to replay mode.");
}

main();
