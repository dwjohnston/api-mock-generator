import { describe, it, expect } from "bun:test";
import { runApplication } from "./runApplication";
import { validTodo1 } from "./testFixtures/programs/validTodo1";
import { validateApplication } from "./validateApplication";
import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";
import { startRecordServer } from "./record";

import dump from "./testFixtures/recordedApisRaw/recorded.json";
import { replayHar } from "./replayHar";
import type { Har } from "har-format";

describe("record", () => {
	it("record", async () => {
		startRecordServer("http://jsonplaceholder.typicode.com", 3000);
		const promises = replayHar(dump as Har, "http://localhost:3000");
		await Promise.allSettled(promises);
	});
});
