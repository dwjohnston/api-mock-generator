import { describe, it, expect } from "bun:test";
import { runApplication } from "../mockServer/runApplication";
import { validTodo1 } from "../_testFixtures/programs/validTodo1";
import { validateApplication } from "../validators/validateApplication";
import { getPostGet } from "../_testFixtures/recordedApis/todos/1_getPostGet";
import { startRecordServer } from "./record";

import dump from "../_testFixtures/recordedApisRaw/recorded.json";
import { replayHar } from "../validators/replayHar";
import type { Har } from "har-format";
import { getLogDir, initLogger } from "../dumpDebugInfo";
import {}

describe("record", () => {
	it("record", async () => {

		initLogger();
		startRecordServer("http://jsonplaceholder.typicode.com", path.join(getLogDir(), "") 3000);
		const promises = replayHar(dump as Har, "http://localhost:3000");
		await Promise.allSettled(promises);
	});
});
