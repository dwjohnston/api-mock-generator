import {
	mkdirSync,
	readdirSync,
	unlinkSync,
	writeFileSync,
	rmSync,
} from "node:fs";

let baseLogDir: string;
let logDir: string;
let testGrouping: string | null;
const baseFixedDir = "testlogs/_fixed";
let fixedDir = baseFixedDir;

export function initTestLogWriter() {
	const dateNow = new Date(Date.now()).toISOString();
	baseLogDir = `testlogs/${dateNow}`;
	logDir = baseLogDir;
	mkdirSync(logDir);

	mkdirSync(baseFixedDir, { recursive: true });
	// Remove all files and directories from fixedDir
	rmSync(baseFixedDir, { recursive: true, force: true });
	mkdirSync(baseFixedDir, { recursive: true });
}

export function setTestLogGrouping(grouping: string | null) {
	testGrouping = grouping;

	if (!baseLogDir) {
		throw new Error("initTestLogWriter must be called before setTestGrouping");
	}
	if (grouping) {
		logDir = `${baseLogDir}/${grouping}`;
		mkdirSync(logDir, { recursive: true });

		fixedDir = `${baseFixedDir}/${grouping}`;
		mkdirSync(fixedDir, { recursive: true });
	} else {
		logDir = baseLogDir;
		fixedDir = baseFixedDir;
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
