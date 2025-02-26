import { describe, it, expect } from "bun:test";
import { runApplication } from "./mockServer/runApplication";
import { validTodo1 } from "./_testFixtures/programs/validTodo1";
import { validateApplication } from "./validators/validateApplication";
import { getPostGet } from "./_testFixtures/recordedApis/todos/1_getPostGet";
import { generateReproduction } from "./archive/generateReproduction";

describe("index", () => {
	it(
		"should validate the application",
		async () => {
			const result = await generateReproduction(getPostGet);
			console.log(JSON.stringify(result.program, null, 2));

			console.log(JSON.stringify(result.errors, null, 2));
		},
		{
			timeout: 30_000,
		},
	);
});
