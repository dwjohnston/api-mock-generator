export function prevalidateJsonSchema(schema: unknown) {
	const str = JSON.stringify(schema);

	console.log(str.length);
	// if (str.length > 15000) {
	// 	throw new Error(
	// 		"Schema is too large. Please reduce the size of the schema.",
	// 	);
	// }

	return;
}
