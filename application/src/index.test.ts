import { describe, it, expect } from "bun:test";
import { runApplication } from "./runApplication";
import { validTodo1 } from "./testFixtures/programs/validTodo1";
import { validateApplication } from "./validateApplication";
import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";
import { replay } from ".";

describe("index", () => {
	it(
		"should validate the application",
		async () => {
			const result = await replay(getPostGet);
			console.log(JSON.stringify(result.program, null, 2));

			console.log(JSON.stringify(result.errors, null, 2));
		},
		{
			timeout: 30_000,
		},
	);
});
