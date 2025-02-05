import type { ErrorType, RecordedApiRequests } from ".";

export async function validateApplication(
	recordedData: RecordedApiRequests,
	url: string,
): Promise<Array<ErrorType>> {
	const errs = [] as Array<ErrorType>;
	for (let i = 0; i < recordedData.length; i++) {
		const datum = recordedData[i];

		const result = await fetch(`${url}/${datum.request.url}`, {
			method: datum.request.method,
			...(datum.request.method?.toUpperCase() !== "GET"
				? {
						headers: {
							"content-type": "application/json",
						},
						body: datum.request.body,
					}
				: {}),
		});

		const text = await result.text();

		if (
			result.status !== datum.response.statusCode ||
			!Bun.deepEquals(JSON.parse(text), JSON.parse(datum.response.body))
		) {
			errs.push({
				requestNumber: i,
				requestData: datum.request,
				expectedResponse: datum.response,
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
