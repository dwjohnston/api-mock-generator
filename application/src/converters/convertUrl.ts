import type { Har } from "har-format";
import type { OpenApiSpec } from "../types/types";

export function convertUrl(
	url: string,
	targetBaseUrl: string,
	sourceUrl: string | Array<string>,
): string {
	for (const u of Array.isArray(sourceUrl) ? sourceUrl : [sourceUrl]) {
		if (url.startsWith(u)) {
			return url.replace(u, targetBaseUrl);
		}
	}

	throw new Error(`Could not find a matching server in the OpenAPI spec.
    url: ${url}
    sourceUrls: ${JSON.stringify(sourceUrl)}
`);
}
