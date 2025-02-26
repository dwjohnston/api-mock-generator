import { describe, it, expect, beforeAll } from "bun:test";
import { openApiToProgram } from "./openApiToProgram"; // Adjust the import path as needed

import spec from "../../../preservedLogs/todos-get-post-get-patch-patch-get/finalResult.json";
import har from "../../../preservedLogs/todos-get-post-get-patch-patch-get/har.json";
import { initTestLogWriter } from "../../testUtils/writeTestLog";
import { asHar } from "../../types/typeHelpers";
beforeAll(() => {
	initTestLogWriter();
});
describe("openApiToProgram", () => {
	it("should convert OpenAPI spec to program correctly", async () => {
		const result = await openApiToProgram(spec, asHar(har));
		expect(result.isSuccess).toBe(true);
		// Add more specific assertions based on the expected output of openApiToProgram
	}, 60_000);
});
