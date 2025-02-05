import { describe, it, expect } from "bun:test";
import { createExternalFunctions } from "./createExternalFunctions";
import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";

describe("createExternalFunctions", () => {
	it("behaves correctly", () => {
		const fns = createExternalFunctions(getPostGet);

		const result = fns.generateRandomString();

		expect(result).toBe("abcd1234");

		expect(fns.generateRandomString()).toBe("random-id-1");
	});
});
