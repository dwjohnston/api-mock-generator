import type { Har } from "har-format";
import type { ApiProgramValidationError, RecordedApiRequests } from "..";

export async function validateApplication(
	recordedData: Har,
	url: string,
): Promise<Array<ApiProgramValidationError>> {
	const errs = [] as Array<ApiProgramValidationError>;
	for (let i = 0; i < recordedData.log.entries.length; i++) {
		const entry = recordedData.log.entries[i];

		const requestPostBody = entry.request.postData?.text ?? null;
		const responseBody = entry.response.content.text ?? null;

		const result = await fetch(`${url}/${entry.request.url}`, {
			method: entry.request.method,
			...(entry.request.method?.toUpperCase() !== "GET"
				? {
						headers: {
							"content-type": "application/json",
						},

						...(requestPostBody ? { body: requestPostBody } : {}),
					}
				: {}),
		});

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

		if (
			result.status !== entry.response.status ||
			!Bun.deepEquals(expectedJson, actualJson)
		) {
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
			});
			break;
		}
	}

	return errs;
}
