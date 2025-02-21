import type { Har } from "har-format";

export function isHar(file: unknown): file is Har {
	return (file as Har).log !== undefined;
}

export function asHar(file: unknown): Har {
	if (!isHar(file)) {
		throw new Error("Invalid HAR file");
	}
	return file;
}
