import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";

let logDir: string;
const fixedDir = `testlogs/_fixed`;
export function initTestLogWriter() {
	const dateNow = new Date(Date.now()).toISOString();
	logDir = `testlogs/${dateNow}`;
	mkdirSync(logDir);

	mkdirSync(fixedDir, { recursive: true });
	//remove files from fixedDir
	const files = readdirSync(fixedDir);
	for (const file of files) {
		unlinkSync(`${fixedDir}/${file}`);
	}
}

export function writeTestLog(testName: string, content: unknown) {
	if (logDir === undefined) {
		throw new Error("initTestLogWriter must be called before writeTestLog");
	}
	writeFileSync(
		`${fixedDir}/${testName}.json`,
		typeof content === "string" ? content : JSON.stringify(content, null, 2),
	);
	writeFileSync(`${logDir}/${testName}.json`, JSON.stringify(content, null, 2));
}
