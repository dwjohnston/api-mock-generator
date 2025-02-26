import type { Har } from "har-format";
import type { ApiProgramValidationError, RecordedApiRequests } from "..";
import { convertUrl } from "../converters/convertUrl";
import assert from "node:assert";
import { asAssertionError } from "../types/typeHelpers";

export async function validateApplication(
	recordedData: Har,
	targetBaseUrl: string,
	sourceUrl: string | Array<string>,
): Promise<Array<ApiProgramValidationError>> {
	const errs = [] as Array<ApiProgramValidationError>;
	for (let i = 0; i < recordedData.log.entries.length; i++) {
		const entry = recordedData.log.entries[i];

		const requestPostBody = entry.request.postData?.text ?? null;
		const responseBody = entry.response.content.text ?? null;

		const url = convertUrl(entry.request.url, targetBaseUrl, sourceUrl);
		const options = {
			method: entry.request.method,
			...(entry.request.method?.toUpperCase() !== "GET"
				? {
						headers: {
							"content-type": "application/json",
						},

						...(requestPostBody ? { body: requestPostBody } : {}),
					}
				: {}),
		};

		const result = await fetch(url, options);

		const text = await result.text();

		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let expectedJson;
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let actualJson;

		try {
			expectedJson = responseBody ? JSON.parse(responseBody) : null;
		} catch {
			expectedJson = null;
		}
		try {
			actualJson = JSON.parse(text);
		} catch {
			actualJson = null;
		}

		try {
			assert.strictEqual(result.status, entry.response.status);
			assert.deepStrictEqual(expectedJson, actualJson);
		} catch (err: unknown) {
			const assertionError = asAssertionError(err);
			errs.push({
				requestNumber: i,
				requestData: {
					url: entry.request.url,
					method: entry.request.method,
					body: requestPostBody ?? undefined,
				},
				expectedResponse: {
					statusCode: entry.response.status,
					body: responseBody ?? undefined,
				},
				actualResponse: {
					statusCode: result.status,
					body: text,
				},
				errorMessage: assertionError.message,
			});
			break;
		}
	}

	return errs;
}
