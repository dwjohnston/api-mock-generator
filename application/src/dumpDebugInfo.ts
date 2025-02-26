import type { ApiProgram } from "./types/routeSchema";
import { mkdir, writeFile } from "node:fs/promises";
import { format } from "date-fns";
import path from "node:path";

import type {
	ConversationHistory,
	ApiProgramValidationError,
	RecordedApiRequests,
} from ".";
import { error } from "elysia";

type LogPayloads =
	| {
			type: "RECORDED_API_REQUESTS";
			payload: RecordedApiRequests;
	  }
	| {
			type: "PROGRAM";
			payload: ApiProgram;
	  }
	| {
			type: "CONVERSATION_HISTORY";
			payload: ConversationHistory;
	  }
	| {
			type: "ERROR";
			payload: ApiProgramValidationError | Error;
	  };

const baseFolder = "logs";
let folderName: string;
export async function initLogger() {
	folderName = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

	// Full path to the new folder inside "debug"
	const fullPath = path.join(baseFolder, folderName);

	// Create the debug folder and subfolder
	await mkdir(fullPath, { recursive: true });
}

export async function log(logData: LogPayloads): Promise<void> {
	const fullPath = path.join(baseFolder, folderName);

	async function writeF(fName: string, content: string) {
		writeFile(path.join(fullPath, fName), content);
		console.log(`✍️ Wrote ${fName}`);
	}

	switch (logData.type) {
		case "CONVERSATION_HISTORY": {
			return writeF(
				"conversation_history.json",
				JSON.stringify(
					logData.payload.map((v) => {
						try {
							if (typeof v.content !== "string") {
								return v;
							}

							let content = v.content;

							//TODO I want a better way to extract the structured errors, for ease of printing in the logs
							const split = v.content.split("```");
							if (split.length === 3) {
								content = split[1];
							}

							//@ts-ignore
							const parsedContent = JSON.parse(content);
							return {
								...v,
								parsedContent,
							};
						} catch {
							return v;
						}
					}),
					null,
					2,
				),
			);
		}
		case "ERROR": {
			if (logData.payload instanceof Error) {
				return writeF(
					"errors.log",
					logData.payload.stack ?? "(No stack trace)",
				);
			}

			return writeF("errors.json", JSON.stringify(logData.payload));
		}

		case "PROGRAM": {
			return writeF("final_conversation.json", JSON.stringify(logData.payload));
		}

		case "RECORDED_API_REQUESTS": {
			return writeF(
				"recorded_api_requests.json",
				JSON.stringify(logData.payload),
			);
		}
	}
}

export function getLogDir(): string {
	if (!folderName) {
		throw new Error("Can't get log directory - logger is not initialised.");
	}
	return path.join(baseFolder, folderName);
}

type DataDumpPayload = {
	data: RecordedApiRequests;
	program: ApiProgram;
	conversationHistory: ConversationHistory;
	errors: Array<ApiProgramValidationError> | null;
};

/**
 * @deprecated
 */
export async function dumpDebugInfo(payload: Error): Promise<void>;
export async function dumpDebugInfo(payload: DataDumpPayload): Promise<void>;
export async function dumpDebugInfo(
	payload: Error | DataDumpPayload,
): Promise<void> {
	console.log("Writing debug info...");
	// Base debug directory
	const baseFolder = "logs";

	// Generate a folder name with the current date and time
	const folderName = format(new Date(), "yyyy-MM-dd_HH-mm-ss");

	// Full path to the new folder inside "debug"
	const fullPath = path.join(baseFolder, folderName);

	// Create the debug folder and subfolder
	await mkdir(fullPath, { recursive: true });

	console.log(`Created folder: ${fullPath}`);

	let files: Array<{ name: string; content: string }>;
	if (payload instanceof Error) {
		files = [
			{
				name: "stack_trace.log",
				content: payload.stack ?? "(No stack trace)",
			},
		];
	} else {
		const { data, program, conversationHistory, errors } = payload;
		// Define files and their content
		files = [
			{
				name: "recorded_api_requests.json",
				content: JSON.stringify(data, null, 2),
			},
			{
				name: "final_program.json",
				content: JSON.stringify(program, null, 2),
			},
			{
				name: "conversation_history.json",
				content: JSON.stringify(
					conversationHistory.map((v) => {
						try {
							if (typeof v.content !== "string") {
								return v;
							}

							let content = v.content;

							//TODO I want a better way to extract the structured errors, for ease of printing in the logs
							const split = v.content.split("```");
							if (split.length === 3) {
								content = split[1];
							}

							//@ts-ignore
							const parsedContent = JSON.parse(content);
							return {
								...v,
								parsedContent,
							};
						} catch {
							return v;
						}
					}),
					null,
					2,
				),
			},
			...(errors
				? [
						{
							name: "errors.json",
							content: JSON.stringify(errors, null, 2),
						},
					]
				: []),
		];
	}

	// Write to files
	await Promise.all(
		files.map(({ name, content }) =>
			writeFile(path.join(fullPath, name), content),
		),
	);

	console.log("Files written successfully.");
}
