import type { Har } from "har-format";

export function stripDomain(url: string): string {
	try {
		const parsedUrl = new URL(url);
		return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
	} catch (error) {
		console.error(`Invalid URL: ${url}`, error);
		return url; // Return original if parsing fails
	}
}

export function replayHar(
	har: Har,
	target: string,
): Array<ReturnType<typeof fetch>> {
	const promises = har.log.entries.map((entry) => {
		const { method, url, postData, headers } = entry.request;

		// Convert headers array to an object
		const headersObject: Record<string, string> = {};
		// biome-ignore lint/complexity/noForEach: <explanation>
		headers?.forEach(({ name, value }) => {
			headersObject[name] = value;
		});

		// Construct fetch options
		const fetchOptions: RequestInit = {
			method,
			headers: headersObject,
		};

		// Add request body if present
		if (postData?.text) {
			fetchOptions.body = postData.text;
		}

		return fetch(`${target}/${stripDomain(url)}`, fetchOptions);
	});

	return promises;
}
