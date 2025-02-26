import { describe, it, expect } from "bun:test";
import { openApiToProgram } from "./openApiToProgram"; // Adjust the import path as needed

import spec from "../../../preservedLogs/harToOpenApi_todos_success/harToOpenApi1.json";
import har from "../../_testFixtures/rawHarFiles/todos_scenario_1";
describe("openApiToProgram", () => {
	it("should convert OpenAPI spec to program correctly", async () => {
		const program = await openApiToProgram(spec, har);
		expect(program).toBeDefined();
		// Add more specific assertions based on the expected output of openApiToProgram
	});
});
