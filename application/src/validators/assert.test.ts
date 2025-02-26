import { describe, it } from "bun:test";
import assert from "node:assert";
import { asAssertionError } from "../types/typeHelpers";
describe("assert", () => {
	it("deepEqual", () => {
		try {
			assert.deepStrictEqual({ a: 1 }, { a: 2 });
		} catch (err) {
			const assertionError = asAssertionError(err);
			console.log(assertionError.message);
		}
	});

	it("equal", () => {
		try {
			assert.strictEqual(1, 2);
		} catch (err) {
			const assertionError = asAssertionError(err);
			console.log(assertionError.message);
		}
	});
});
