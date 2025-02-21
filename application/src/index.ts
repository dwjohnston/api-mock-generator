import { stdin } from "node:process";
import type OpenAI from "openai";

import { dumpDebugInfo, getLogDir, initLogger } from "./dumpDebugInfo";

import { startRecordServer, startRecordServer2 } from "./record";
import { generateReproduction } from "./generateReproduction";
import path from "node:path";
const args = process.argv;

let target: string;
const targetArg = args.find((arg) => arg.startsWith("--target="));

if (targetArg) {
	target = targetArg.split("=")[1];
} else {
	target = "http://localhost:3000";
}

async function prompt(message: string) {
	return new Promise((resolve) => {
		console.log(message);
		stdin.once("data", () => resolve(null));
	});
}
export type RecordedApiRequests = Array<{
	request: {
		url?: string;
		method?: string;
		body?: string;
	};
	response: {
		statusCode?: number;
		body?: string;
	};
}>;

async function main() {
	try {
		//   console.clear();

		initLogger();
		await prompt("Press Enter to start recording...");

		console.log("Recording started...");
		const [close, url] = await startRecordServer2(
			target,
			path.join(getLogDir(), "raw-har.json"),
			3001,
		);
		await prompt("Press Enter to switch to replay mode...");
		const data = close();

		console.log("Switched to replay mode.");
		const result = await generateReproduction(data);

		await dumpDebugInfo(result);
	} catch (err) {
		if (err instanceof Error) {
			dumpDebugInfo(err);
		} else {
			dumpDebugInfo(new Error(`Unknown error type: ${err}`));
		}
	}
}

export type ConversationHistory =
	Array<OpenAI.Chat.Completions.ChatCompletionMessageParam>;

export const aiName = "openai";
export const VALIDATION_PORT = 3002;

export const maxIterations = 1;

export type ErrorType = {
	requestNumber: number;
	requestData: RecordedApiRequests[number]["request"];
	expectedResponse: RecordedApiRequests[number]["response"];
	actualResponse: {
		statusCode: number;
		body: string;
	};
};

main();
