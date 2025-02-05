import type { RouteSchema } from "./routeSchema";
import { mkdir, writeFile } from "node:fs/promises";
import { format } from "date-fns";
import path from "node:path";

import type { ConversationHistory, ErrorType, RecordedApiRequests } from ".";

export async function dumpDebugInfo(
	data: RecordedApiRequests,
	program: RouteSchema,
	conversationHistory: ConversationHistory,
	errors: Array<ErrorType> | null,
) {
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

	// Define files and their content
	const files = [
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

	// Write to files
	await Promise.all(
		files.map(({ name, content }) =>
			writeFile(path.join(fullPath, name), content),
		),
	);

	console.log("Files written successfully.");
}
