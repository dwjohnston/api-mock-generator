import { describe, it, expect } from "bun:test";
import { runApplication } from "./runApplication";
import { validTodo1 } from "./testFixtures/programs/validTodo1";
import { validateApplication } from "./validateApplication";
import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";

describe("validateApplication", () => {
	it("should validate the application", async () => {
		const result = await new Promise<ReturnType<typeof validateApplication>>(
			(res, rej) => {
				runApplication(validTodo1, 3002, async () => {
					const result = validateApplication(
						getPostGet,
						"http://localhost:3002",
					);
					res(result);
				});
			},
		);

		console.log(result);
		expect(result.length).toBe(0);
	});
});
