import type { Har } from "har-format";
import { AssertionError } from "node:assert";

export function isHar(file: unknown): file is Har {
	return (file as Har).log !== undefined;
}

export function asHar(file: unknown): Har {
	if (!isHar(file)) {
		throw new Error("Invalid HAR file");
	}
	return file;
}

export function asAssertionError(err: unknown): AssertionError {
	if (!(err instanceof AssertionError)) {
		throw new Error(`Type was not an assertion error, it was: ${typeof err}`);
	}
	return err;
}
