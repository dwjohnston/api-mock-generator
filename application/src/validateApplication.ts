import type { ErrorType, RecordedApiRequests } from "..";

export async function validateApplication(
	recordedData: RecordedApiRequests,
	url: string,
): Promise<Array<ErrorType>> {
	const errs = [] as Array<ErrorType>;
	for (let i = 0; i < recordedData.length; i++) {
		const datum = recordedData[i];

		console.log({
			method: datum.request.method,
			body: JSON.stringify(datum.request.body),
		});
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

		const json = await result.text();
		if (
			result.status !== datum.response.statusCode ||
			json !== datum.response.body
		) {
			errs.push({
				requestNumber: i,
				requestData: datum.request,
				expectedResponse: datum.response,
				actualResponse: {
					statusCode: result.status,
					body: json,
				},
			});
			break;
		}
	}

	return errs;
}
