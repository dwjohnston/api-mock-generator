import { initTestLogWriter, writeTestLog } from "../testUtils/writeTestLog";
import schema from "../specs/open-api-v3.1-2024-11-14 copy.json";
interface JSONSchema {
	[key: string]: any;
}

/**
 * Recursively traverses a JSON Schema and applies modifications:
 * - If a node has a "type" property and its key is not in the parent's "required" array,
 *   then add `nullable: true` to the node.
 * - If a node has "type": "object", then add "additionalProperties": false.
 *
 * @param schema - The current schema node.
 * @param parentRequired - The parent's required array (if any).
 * @param currentKey - The key for the current node in the parent's "properties" (if any).
 */
function traverseSchema(schema: JSONSchema): void {
	for (const key in schema["$defs"]) {
		const node = schema["$defs"][key];
		if (!("type" in node)) {
			continue;
		}
		if (node.type === "object") {
			node.additionalProperties = false;
			const required = node.required || [];
			if (!node.required) {
				node.required = required;
			}

			for (const property in node.properties) {
				console.log(key, property);
				if (required.includes(property)) {
					// Do nothing
				} else {
					if (typeof node.properties[property] === "object") {
						node.properties[property].nullable = true;
					}
					required.push(property);
				}
			}
		} else {
			throw new Error(`Encounted node of type: ${node.type}`);
		}
	}
}

// --- Example Usage ---

// Sample JSON Schema input

// Traverse and modify the schema
console.log(schema);
console.log(schema["$defs"]);
traverseSchema(JSON.parse(JSON.stringify(schema)));

// Output the modified schema
initTestLogWriter();

writeTestLog("modifiedSchema", schema);
