import { describe, it, expect } from "bun:test";
import { harToOpenApi } from "./harToOpenApi";
import har from "./testFixtures/rawHarFiles/todos_scenario_1";
import type { Har } from "har-format";
import { asHar, isHar } from "./typeHelpers";
import fs from "node:fs";

describe("harToOpenApi", async () => {
	it("should generate OpenAPI spec from HAR file", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const result = (await harToOpenApi(asHar(har))) as any;

		console.log(result);
		fs.writeFileSync(
			`testlogs/${new Date(Date.now()).toISOString()}-harToOpenApi1.json`,
			JSON.stringify(result, null, 2),
		);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("openapi");
		expect(Object.values(result.paths).length).toBe(2);
		expect(result.paths["/todos"]).toBeDefined();
		expect(result.paths["/todos/{id}"]).toBeDefined();
		expect(result.paths["/todos"].get).toBeDefined();
		expect(result.paths["/todos"].post).toBeDefined();
		expect(result.paths["/todos/{id}"].get).toBeDefined();
	});
});
