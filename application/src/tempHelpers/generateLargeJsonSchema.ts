import fs from "node:fs";
import { initTestLogWriter, writeTestLog } from "../testUtils/writeTestLog";

function generateJsonSchema() {
	const schema = {
		$schema: "http://json-schema.org/draft-07/schema#",
		type: "object",
		properties: {},
		required: [],
	};

	for (let i = 1; i <= 200; i++) {
		const propName = `property${i}`;
		//@ts-ignore
		schema.properties[propName] = { type: "string" };
		//@ts-ignore
		schema.required.push(propName);
	}

	return schema;
}

const schema = generateJsonSchema();
initTestLogWriter();
writeTestLog("largeSchema", schema);
console.log(
	"JSON Schema with 101 properties has been generated and saved to schema.json.",
);
