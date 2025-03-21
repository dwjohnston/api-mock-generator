import { describe, it, expect, beforeAll } from "bun:test";
import { harToOpenApi } from "./harToOpenApi";
import todosScenario1 from "../../_testFixtures/rawHarFiles/todos_scenario_1";
import getPostGetPatchPatchGet from "../../../preservedLogs/todos-get-post-get-patch-patch-get/har.json";

import { asHar } from "../../types/typeHelpers";
import {
	initTestLogWriter,
	setTestLogGrouping,
	writeTestLog,
} from "../../testUtils/writeTestLog";

beforeAll(() => {
	initTestLogWriter();
});
describe("harToOpenApi", async () => {
	it("todosScenario1", async () => {
		const result = await harToOpenApi(asHar(todosScenario1), "test-x1");
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const content = result.content as any;

		writeTestLog("harToOpenApi1", content);

		expect(content).toBeDefined();
		expect(content).toHaveProperty("openapi");
		expect(Object.values(content.paths).length).toBe(2);
		expect(content.paths["/todos"]).toBeDefined();
		const todosIdRegex = /\/todos\/\{[\w-]+\}/;
		const [, todosIdPath] = Object.entries(content.paths).find(
			(entry) => {
				const [key, value] = entry;
				return todosIdRegex.test(key as string);
			},
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		) as any;
		expect(todosIdPath).toBeDefined();

		expect(content.paths["/todos"].get).toBeDefined();
		expect(content.paths["/todos"].post).toBeDefined();
		expect(todosIdPath.get).toBeDefined();

		const getTodosResponses = Object.values(
			content.paths["/todos"].get.responses["200"].content,
		);
		expect(getTodosResponses.length).toBe(1);

		const postTodosResponses = Object.values(
			content.paths["/todos"].post.responses["201"].content,
		);
		expect(postTodosResponses.length).toBe(1);

		const getTodosIdResponses = Object.values(
			todosIdPath.get.responses["200"].content,
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
	}, 60_000);

	it.only("get-post-get-patch-patch-get", async () => {
		setTestLogGrouping("todos-get-post-get-patch-patch-get");
		const result = await harToOpenApi(
			asHar(getPostGetPatchPatchGet),
			"test-x1",
		);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const content = result.content as any;
		writeTestLog("har", getPostGetPatchPatchGet);
		writeTestLog("finalResult", content);

		expect(content).toBeDefined();
		expect(content).toHaveProperty("openapi");
		expect(Object.values(content.paths).length).toBe(2);
		expect(content.paths["/todos"]).toBeDefined();
		const todosIdRegex = /\/todos\/\{[\w-]+\}/;
		const [, todosIdPath] = Object.entries(content.paths).find(
			(entry) => {
				const [key, value] = entry;
				return todosIdRegex.test(key as string);
			},
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		) as any;
		expect(todosIdPath).toBeDefined();

		expect(content.paths["/todos"].get).toBeDefined();
		expect(content.paths["/todos"].post).toBeDefined();
		expect(todosIdPath.patch).toBeDefined();

		const getTodosResponses = Object.values(
			content.paths["/todos"].get.responses["200"].content,
		);
		expect(getTodosResponses.length).toBe(1);

		const postTodosResponses = Object.values(
			content.paths["/todos"].post.responses["201"].content,
		);
		expect(postTodosResponses.length).toBe(1);

		const patchTodosIdResponses = Object.values(
			todosIdPath.patch.responses["200"].content,
		);
		expect(patchTodosIdResponses.length).toBe(1);

		//@ts-expect-error
		const getTodosExamples = getTodosResponses[0].examples;
		//@ts-expect-error
		const postTodosExamples = postTodosResponses[0].examples;
		//@ts-expect-error
		const getTodosIdExamples = patchTodosIdResponses[0].examples;

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
	}, 60_000);
});
