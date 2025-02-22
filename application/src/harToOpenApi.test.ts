import { describe, it, expect, beforeAll } from "bun:test";
import { harToOpenApi } from "./harToOpenApi";
import har from "./testFixtures/rawHarFiles/todos_scenario_1";
import { asHar, isHar } from "./typeHelpers";
import { initTestLogWriter, writeTestLog } from "./testUtils/writeTestLog";

beforeAll(() => {
	initTestLogWriter();
});
describe("harToOpenApi", async () => {
	it("should generate OpenAPI spec from HAR file", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const result = (await harToOpenApi(asHar(har), "test-x1")) as any;

		writeTestLog("harToOpenApi1", result);

		expect(result).toBeDefined();
		expect(result).toHaveProperty("openapi");
		expect(Object.values(result.paths).length).toBe(2);
		expect(result.paths["/todos"]).toBeDefined();
		expect(result.paths["/todos/{id}"]).toBeDefined();
		expect(result.paths["/todos"].get).toBeDefined();
		expect(result.paths["/todos"].post).toBeDefined();
		expect(result.paths["/todos/{id}"].get).toBeDefined();

		const getTodosResponses = Object.values(
			result.paths["/todos"].get.responses["200"].content,
		);
		expect(getTodosResponses.length).toBe(1);

		const postTodosResponses = Object.values(
			result.paths["/todos"].post.responses["201"].content,
		);
		expect(postTodosResponses.length).toBe(1);

		const getTodosIdResponses = Object.values(
			result.paths["/todos/{id}"].get.responses["200"].content,
		);
		expect(getTodosIdResponses.length).toBe(1);

		//@ts-expect-error
		const getTodosExamples = getTodosResponses[0].examples;
		//@ts-expect-error
		const postTodosExamples = postTodosResponses[0].examples;
		//@ts-expect-error
		const getTodosIdExamples = getTodosIdResponses[0].examples;

		expect(getTodosExamples).toBeDefined();
		expect(postTodosExamples).toBeDefined();
		expect(getTodosIdExamples).toBeDefined();

		// expect(getTodosExamples["example-1"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(getTodosExamples["example-1"]["x-example-step-number"]).toBe(1);

		// expect(postTodosExamples["example-2"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(postTodosExamples["example-2"]["x-example-step-number"]).toBe(2);

		// expect(postTodosExamples["example-3"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(postTodosExamples["example-3"]["x-example-step-number"]).toBe(3);

		// expect(postTodosExamples["example-4"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(postTodosExamples["example-4"]["x-example-step-number"]).toBe(4);

		// expect(getTodosIdExamples["example-5"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(getTodosIdExamples["example-5"]["x-example-step-number"]).toBe(5);

		// expect(getTodosIdExamples["example-6"]["x-example-scenario-name"]).toBe(
		// 	"test-x1",
		// );
		// expect(getTodosIdExamples["example-6"]["x-example-step-number"]).toBe(6);
	});
});
