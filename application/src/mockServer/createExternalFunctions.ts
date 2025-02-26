import type { Har } from "har-format";
import type { RecordedApiRequests } from "..";
import type { ExternalFunctions } from "./runApplication";

export function createExternalFunctions(data: Har): ExternalFunctions {
	const stringIds = new Set<string>();
	const numberIds = new Set<number>();

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	function extractIds(obj: any) {
		if (typeof obj !== "object" || obj === null) return;

		for (const key in obj) {
			if (key === "id") {
				if (typeof obj[key] === "string") {
					stringIds.add(obj[key]);
				} else if (typeof obj[key] === "number") {
					numberIds.add(obj[key]);
				}
			} else {
				extractIds(obj[key]); // Recursively check nested objects
			}
		}
	}

	data.log.entries
		.flatMap((v) => {
			// Do we need to include the request postData?
			return [v.request.postData, v.response.content.text];
		})

		.map((v) => {
			try {
				return JSON.parse(v as string);
			} catch {
				return null;
			}
		})

		.forEach(extractIds);

	const uniqueStringIds = Array.from(stringIds);
	const uniqueNumberIds = Array.from(numberIds);

	let stringIndex = 0;
	let numberIndex = 0;

	function generateRandomString(): string {
		if (stringIndex < uniqueStringIds.length) {
			const str = uniqueStringIds[stringIndex++];
			return str;
		}
		return `random-id-${stringIndex}`;
	}

	function generateRandomNumber(): number {
		if (numberIndex < uniqueNumberIds.length) {
			return uniqueNumberIds[numberIndex++];
		}
		return numberIndex;
	}

	function getCurrentDate(): Date {
		return new Date(1);
	}

	return { generateRandomString, generateRandomNumber, getCurrentDate };
}
