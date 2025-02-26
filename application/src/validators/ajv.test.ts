import { describe, it, expect } from "bun:test";
import Ajv from "ajv/dist/2020";
import openApiSchmea from "../specs/open-api-v3.1-2024-11-14.json";
import openApiSchemaAjvFix from "../specs/open-api-v3.1-2024-11-14-ajv-fix.json";
import openApiSpec from "../../preservedLogs/ajv-failure/harToOpenApi_0_openai_response_content.json";
describe("AJV Validator", () => {
	it("Sanity test - simple schema", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
			},
			required: ["foo"],
			additionalProperties: false,
		};

		const validate = ajv.compile(schema);
		const valid = validate({ foo: "bar" });

		expect(valid).toBe(true);
		expect(validate.errors).toBeNull();
	});

	it("if else schema", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				alpha: {
					type: "string",
				},
				foo: {
					// If it's an object, and it has a $ref property
					// The the object should match the 'a' schema.
					if: {
						type: "object",
						required: ["$ref"],
					},
					// biome-ignore lint/suspicious/noThenProperty: <explanation>
					then: {
						$ref: "#/$defs/a",
					},
					else: {
						$ref: "#/$defs/b",
					},
				},
			},
			required: ["alpha", "foo"],

			$defs: {
				a: {
					type: "object",
					properties: {
						$ref: {
							type: "string",
						},
					},
				},
				b: {
					type: "number",
				},
			},
		};

		const validate = ajv.compile(schema);

		validate({
			alpha: "a",
		});

		expect(validate.errors).not.toBeNull();

		validate({
			alpha: "a",
			foo: 1,
		});
		expect(validate.errors).toBeNull();

		validate({
			alpha: "a",
			foo: {
				$ref: "a",
			},
		});

		expect(validate.errors).toBeNull();
	});

	it("anchor", () => {
		const ajv = new Ajv({ strict: false });
		const validate = ajv.compile({
			$id: "https://example.com/schemas/myschema", // 👈 needed
			type: "object",
			properties: {
				street_address: {
					$ref: "https://example.com/schemas/myschema#foo", // Refer to the anchor via the id
				},
				city: { type: "string" },
				state: { type: "string" },
			},
			$defs: {
				a: {
					type: "object",
					properties: {
						bar: {
							type: "string",
						},
						foo: {
							$anchor: "foo",
							type: "number",
						},
					},
				},
				b: {
					type: "number",
				},
			},
			required: ["street_address", "city", "state"],
		});
		validate({
			street_address: 1,
			city: "a",
			state: "b",
		});

		expect(validate.errors).toBeNull();
	});

	it("Additional properties - no requirements", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
			},
			required: ["foo"],
		};

		const validate = ajv.compile(schema);
		const valid = validate({ foo: "bar" });

		expect(valid).toBe(true);
		expect(validate.errors).toBeNull();

		validate({ foo: "bar", baz: "qux" });
		expect(validate.errors).toBeNull();
	});

	it("Additional properties - additionalProperties:false", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
			},
			required: ["foo"],
			additionalProperties: false,
		};

		const validate = ajv.compile(schema);
		const valid = validate({ foo: "bar" });

		expect(valid).toBe(true);
		expect(validate.errors).toBeNull();

		validate({ foo: "bar", baz: "qux" });
		expect(validate.errors).not.toBeNull();
	});

	it("Additional properties - unevaluatedProperties:false", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
			},
			required: ["foo"],
			unevaluatedProperties: false,
		};

		const validate = ajv.compile(schema);
		const valid = validate({ foo: "bar" });

		expect(valid).toBe(true);
		expect(validate.errors).toBeNull();

		validate({ foo: "bar", baz: "qux" });
		expect(validate.errors).not.toBeNull();
	});

	it("Additional properties - unevaluatedProperties:false", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
				bar: { $ref: "#/$defs/myobject" },
			},
			required: ["foo"],
			$defs: {
				myobject: {
					// point is - unevaluatedProperties: false still allows this to be any old object
					type: "object",
				},
			},
			unevaluatedProperties: false,
		};

		const validate = ajv.compile(schema);
		const valid = validate({ foo: "bar" });

		expect(valid).toBe(true);
		expect(validate.errors).toBeNull();

		validate({
			foo: "bar",
			bar: {
				foo: "bar",
			},
		});
		expect(validate.errors).toBeNull();
	});

	it("Dynamic ref", () => {
		const ajv = new Ajv();
		const schema = {
			type: "object",
			properties: {
				foo: { type: "string" },
				bar: { $dynamicRef: "#meta" },
			},
			required: ["foo"],
			$defs: {
				schema: {
					$comment: "https://spec.openapis.org/oas/v3.1#schema-object",
					$dynamicAnchor: "meta",
					type: ["object", "boolean"],
				},
			},
			unevaluatedProperties: false,
		};

		const validate = ajv.compile(schema);
		validate({
			foo: "bar",
			bar: {
				foo: "bar",
			},
		});
		expect(validate.errors).toBeNull();
	});

	/**
	 * Failing.
	 *
	 * Shows current behavior of the schema + ai response
	 */
	it.skip("OpenAPI schema", () => {
		const ajv = new Ajv({ strict: false });
		const validate = ajv.compile(openApiSchmea);
		validate(openApiSpec);
		expect(validate.errors).toBeNull();
	});

	it("OpenAPI schema - ajv fix", () => {
		const ajv = new Ajv({ strict: false });
		const validate = ajv.compile(openApiSchemaAjvFix);
		validate(openApiSpec);
		expect(validate.errors).toBeNull();
	});

	it("OpenAPI schema - partial", () => {
		const ajv = new Ajv({ strict: false });
		const validate = ajv.compile({
			type: "object",
			properties: {
				value: {
					$ref: "#/$defs/response",
				},
			},
			$defs: {
				info: {
					$comment: "https://spec.openapis.org/oas/v3.1#info-object",
					type: "object",
					properties: {
						title: {
							type: "string",
						},
						summary: {
							type: "string",
						},
						description: {
							type: "string",
						},
						termsOfService: {
							type: "string",
							format: "uri",
						},
						contact: {
							$ref: "#/$defs/contact",
						},
						license: {
							$ref: "#/$defs/license",
						},
						version: {
							type: "string",
						},
					},
					required: ["title", "version"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				contact: {
					$comment: "https://spec.openapis.org/oas/v3.1#contact-object",
					type: "object",
					properties: {
						name: {
							type: "string",
						},
						url: {
							type: "string",
							format: "uri",
						},
						email: {
							type: "string",
							format: "email",
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				license: {
					$comment: "https://spec.openapis.org/oas/v3.1#license-object",
					type: "object",
					properties: {
						name: {
							type: "string",
						},
						identifier: {
							type: "string",
						},
						url: {
							type: "string",
							format: "uri",
						},
					},
					required: ["name"],
					dependentSchemas: {
						identifier: {
							not: {
								required: ["url"],
							},
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				server: {
					$comment: "https://spec.openapis.org/oas/v3.1#server-object",
					type: "object",
					properties: {
						url: {
							type: "string",
						},
						description: {
							type: "string",
						},
						variables: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/server-variable",
							},
						},
					},
					required: ["url"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"server-variable": {
					$comment: "https://spec.openapis.org/oas/v3.1#server-variable-object",
					type: "object",
					properties: {
						enum: {
							type: "array",
							items: {
								type: "string",
							},
							minItems: 1,
						},
						default: {
							type: "string",
						},
						description: {
							type: "string",
						},
					},
					required: ["default"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				components: {
					$comment: "https://spec.openapis.org/oas/v3.1#components-object",
					type: "object",
					properties: {
						schemas: {
							type: "object",
							additionalProperties: {
								$dynamicRef: "#meta",
							},
						},
						responses: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/response-or-reference",
							},
						},
						parameters: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/parameter-or-reference",
							},
						},
						examples: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/example-or-reference",
							},
						},
						requestBodies: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/request-body-or-reference",
							},
						},
						headers: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/header-or-reference",
							},
						},
						securitySchemes: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/security-scheme-or-reference",
							},
						},
						links: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/link-or-reference",
							},
						},
						callbacks: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/callbacks-or-reference",
							},
						},
						pathItems: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/path-item",
							},
						},
					},
					patternProperties: {
						"^(schemas|responses|parameters|examples|requestBodies|headers|securitySchemes|links|callbacks|pathItems)$":
							{
								$comment:
									"Enumerating all of the property names in the regex above is necessary for unevaluatedProperties to work as expected",
								propertyNames: {
									pattern: "^[a-zA-Z0-9._-]+$",
								},
							},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				paths: {
					$comment: "https://spec.openapis.org/oas/v3.1#paths-object",
					type: "object",
					patternProperties: {
						"^/": {
							$ref: "#/$defs/path-item",
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"path-item": {
					$comment: "https://spec.openapis.org/oas/v3.1#path-item-object",
					type: "object",
					properties: {
						$ref: {
							type: "string",
							format: "uri-reference",
						},
						summary: {
							type: "string",
						},
						description: {
							type: "string",
						},
						servers: {
							type: "array",
							items: {
								$ref: "#/$defs/server",
							},
						},
						parameters: {
							type: "array",
							items: {
								$ref: "#/$defs/parameter-or-reference",
							},
						},
						get: {
							$ref: "#/$defs/operation",
						},
						put: {
							$ref: "#/$defs/operation",
						},
						post: {
							$ref: "#/$defs/operation",
						},
						delete: {
							$ref: "#/$defs/operation",
						},
						options: {
							$ref: "#/$defs/operation",
						},
						head: {
							$ref: "#/$defs/operation",
						},
						patch: {
							$ref: "#/$defs/operation",
						},
						trace: {
							$ref: "#/$defs/operation",
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				operation: {
					$comment: "https://spec.openapis.org/oas/v3.1#operation-object",
					type: "object",
					properties: {
						tags: {
							type: "array",
							items: {
								type: "string",
							},
						},
						summary: {
							type: "string",
						},
						description: {
							type: "string",
						},
						externalDocs: {
							$ref: "#/$defs/external-documentation",
						},
						operationId: {
							type: "string",
						},
						parameters: {
							type: "array",
							items: {
								$ref: "#/$defs/parameter-or-reference",
							},
						},
						requestBody: {
							$ref: "#/$defs/request-body-or-reference",
						},
						responses: {
							$ref: "#/$defs/responses",
						},
						callbacks: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/callbacks-or-reference",
							},
						},
						deprecated: {
							default: false,
							type: "boolean",
						},
						security: {
							type: "array",
							items: {
								$ref: "#/$defs/security-requirement",
							},
						},
						servers: {
							type: "array",
							items: {
								$ref: "#/$defs/server",
							},
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"external-documentation": {
					$comment:
						"https://spec.openapis.org/oas/v3.1#external-documentation-object",
					type: "object",
					properties: {
						description: {
							type: "string",
						},
						url: {
							type: "string",
							format: "uri",
						},
					},
					required: ["url"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				parameter: {
					$comment: "https://spec.openapis.org/oas/v3.1#parameter-object",
					type: "object",
					properties: {
						name: {
							type: "string",
						},
						in: {
							enum: ["query", "header", "path", "cookie"],
						},
						description: {
							type: "string",
						},
						required: {
							default: false,
							type: "boolean",
						},
						deprecated: {
							default: false,
							type: "boolean",
						},
						schema: {
							$dynamicRef: "#meta",
						},
						content: {
							$ref: "#/$defs/content",
							minProperties: 1,
							maxProperties: 1,
						},
					},
					required: ["name", "in"],
					oneOf: [
						{
							required: ["schema"],
						},
						{
							required: ["content"],
						},
					],
					if: {
						properties: {
							in: {
								const: "query",
							},
						},
						required: ["in"],
					},
					then: {
						properties: {
							allowEmptyValue: {
								default: false,
								type: "boolean",
							},
						},
					},
					dependentSchemas: {
						schema: {
							properties: {
								style: {
									type: "string",
								},
								explode: {
									type: "boolean",
								},
							},
							allOf: [
								{
									$ref: "#/$defs/examples",
								},
								{
									$ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-path",
								},
								{
									$ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-header",
								},
								{
									$ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-query",
								},
								{
									$ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-cookie",
								},
								{
									$ref: "#/$defs/styles-for-form",
								},
							],
							$defs: {
								"styles-for-path": {
									if: {
										properties: {
											in: {
												const: "path",
											},
										},
										required: ["in"],
									},
									then: {
										properties: {
											style: {
												default: "simple",
												enum: ["matrix", "label", "simple"],
											},
											required: {
												const: true,
											},
										},
										required: ["required"],
									},
								},
								"styles-for-header": {
									if: {
										properties: {
											in: {
												const: "header",
											},
										},
										required: ["in"],
									},
									then: {
										properties: {
											style: {
												default: "simple",
												const: "simple",
											},
										},
									},
								},
								"styles-for-query": {
									if: {
										properties: {
											in: {
												const: "query",
											},
										},
										required: ["in"],
									},
									then: {
										properties: {
											style: {
												default: "form",
												enum: [
													"form",
													"spaceDelimited",
													"pipeDelimited",
													"deepObject",
												],
											},
											allowReserved: {
												default: false,
												type: "boolean",
											},
										},
									},
								},
								"styles-for-cookie": {
									if: {
										properties: {
											in: {
												const: "cookie",
											},
										},
										required: ["in"],
									},
									then: {
										properties: {
											style: {
												default: "form",
												const: "form",
											},
										},
									},
								},
							},
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"parameter-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/parameter",
					},
				},
				"request-body": {
					$comment: "https://spec.openapis.org/oas/v3.1#request-body-object",
					type: "object",
					properties: {
						description: {
							type: "string",
						},
						content: {
							$ref: "#/$defs/content",
						},
						required: {
							default: false,
							type: "boolean",
						},
					},
					required: ["content"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"request-body-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/request-body",
					},
				},
				content: {
					$comment: "https://spec.openapis.org/oas/v3.1#fixed-fields-10",
					type: "object",
					additionalProperties: {
						$ref: "#/$defs/media-type",
					},
					propertyNames: {
						format: "media-range",
					},
				},
				"media-type": {
					$comment: "https://spec.openapis.org/oas/v3.1#media-type-object",
					type: "object",
					properties: {
						schema: {
							$ref: "#/$defs/schema",
						},
						encoding: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/encoding",
							},
						},
					},
					allOf: [
						{
							$ref: "#/$defs/specification-extensions",
						},
						{
							$ref: "#/$defs/examples",
						},
					],
					unevaluatedProperties: false,
				},
				encoding: {
					$comment: "https://spec.openapis.org/oas/v3.1#encoding-object",
					type: "object",
					properties: {
						contentType: {
							type: "string",
							format: "media-range",
						},
						headers: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/header-or-reference",
							},
						},
						style: {
							default: "form",
							enum: ["form", "spaceDelimited", "pipeDelimited", "deepObject"],
						},
						explode: {
							type: "boolean",
						},
						allowReserved: {
							default: false,
							type: "boolean",
						},
					},
					allOf: [
						{
							$ref: "#/$defs/specification-extensions",
						},
						{
							$ref: "#/$defs/styles-for-form",
						},
					],
					unevaluatedProperties: false,
				},
				responses: {
					$comment: "https://spec.openapis.org/oas/v3.1#responses-object",
					type: "object",
					properties: {
						default: {
							$ref: "#/$defs/response-or-reference",
						},
					},
					patternProperties: {
						"^[1-5](?:[0-9]{2}|XX)$": {
							$ref: "#/$defs/response-or-reference",
						},
					},
					minProperties: 1,
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
					if: {
						$comment:
							"either default, or at least one response code property must exist",
						patternProperties: {
							"^[1-5](?:[0-9]{2}|XX)$": false,
						},
					},
					then: {
						required: ["default"],
					},
				},
				response: {
					$comment: "https://spec.openapis.org/oas/v3.1#response-object",
					type: "object",
					properties: {
						description: {
							type: "string",
						},
						headers: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/header-or-reference",
							},
						},
						content: {
							$ref: "#/$defs/content",
						},
						links: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/link-or-reference",
							},
						},
					},
					required: ["description"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"response-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/response",
					},
				},
				callbacks: {
					$comment: "https://spec.openapis.org/oas/v3.1#callback-object",
					type: "object",
					$ref: "#/$defs/specification-extensions",
					additionalProperties: {
						$ref: "#/$defs/path-item",
					},
				},
				"callbacks-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/callbacks",
					},
				},
				example: {
					$comment: "https://spec.openapis.org/oas/v3.1#example-object",
					type: "object",
					properties: {
						summary: {
							type: "string",
						},
						description: {
							type: "string",
						},
						value: true,
						externalValue: {
							type: "string",
							format: "uri",
						},
					},
					not: {
						required: ["value", "externalValue"],
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"example-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/example",
					},
				},
				link: {
					$comment: "https://spec.openapis.org/oas/v3.1#link-object",
					type: "object",
					properties: {
						operationRef: {
							type: "string",
							format: "uri-reference",
						},
						operationId: {
							type: "string",
						},
						parameters: {
							$ref: "#/$defs/map-of-strings",
						},
						requestBody: true,
						description: {
							type: "string",
						},
						body: {
							$ref: "#/$defs/server",
						},
					},
					oneOf: [
						{
							required: ["operationRef"],
						},
						{
							required: ["operationId"],
						},
					],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"link-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/link",
					},
				},
				header: {
					$comment: "https://spec.openapis.org/oas/v3.1#header-object",
					type: "object",
					properties: {
						description: {
							type: "string",
						},
						required: {
							default: false,
							type: "boolean",
						},
						deprecated: {
							default: false,
							type: "boolean",
						},
						schema: {
							$dynamicRef: "#meta",
						},
						content: {
							$ref: "#/$defs/content",
							minProperties: 1,
							maxProperties: 1,
						},
					},
					oneOf: [
						{
							required: ["schema"],
						},
						{
							required: ["content"],
						},
					],
					dependentSchemas: {
						schema: {
							properties: {
								style: {
									default: "simple",
									const: "simple",
								},
								explode: {
									default: false,
									type: "boolean",
								},
							},
							$ref: "#/$defs/examples",
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				"header-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},
					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/header",
					},
				},
				tag: {
					$comment: "https://spec.openapis.org/oas/v3.1#tag-object",
					type: "object",
					properties: {
						name: {
							type: "string",
						},
						description: {
							type: "string",
						},
						externalDocs: {
							$ref: "#/$defs/external-documentation",
						},
					},
					required: ["name"],
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
				},
				reference: {
					$comment: "https://spec.openapis.org/oas/v3.1#reference-object",
					type: "object",
					properties: {
						$ref: {
							type: "string",
							format: "uri-reference",
						},
						summary: {
							type: "string",
						},
						description: {
							type: "string",
						},
					},
				},
				schema: {
					$comment: "https://spec.openapis.org/oas/v3.1#schema-object",
					$dynamicAnchor: "meta",
					type: ["object", "boolean"],
				},
				"security-scheme": {
					$comment: "https://spec.openapis.org/oas/v3.1#security-scheme-object",
					type: "object",
					properties: {
						type: {
							enum: ["apiKey", "http", "mutualTLS", "oauth2", "openIdConnect"],
						},
						description: {
							type: "string",
						},
					},
					required: ["type"],
					allOf: [
						{
							$ref: "#/$defs/specification-extensions",
						},
						{
							$ref: "#/$defs/security-scheme/$defs/type-apikey",
						},
						{
							$ref: "#/$defs/security-scheme/$defs/type-http",
						},
						{
							$ref: "#/$defs/security-scheme/$defs/type-http-bearer",
						},
						{
							$ref: "#/$defs/security-scheme/$defs/type-oauth2",
						},
						{
							$ref: "#/$defs/security-scheme/$defs/type-oidc",
						},
					],
					unevaluatedProperties: false,
					$defs: {
						"type-apikey": {
							if: {
								properties: {
									type: {
										const: "apiKey",
									},
								},
								required: ["type"],
							},
							then: {
								properties: {
									name: {
										type: "string",
									},
									in: {
										enum: ["query", "header", "cookie"],
									},
								},
								required: ["name", "in"],
							},
						},
						"type-http": {
							if: {
								properties: {
									type: {
										const: "http",
									},
								},
								required: ["type"],
							},
							then: {
								properties: {
									scheme: {
										type: "string",
									},
								},
								required: ["scheme"],
							},
						},
						"type-http-bearer": {
							if: {
								properties: {
									type: {
										const: "http",
									},
									scheme: {
										type: "string",
										pattern: "^[Bb][Ee][Aa][Rr][Ee][Rr]$",
									},
								},
								required: ["type", "scheme"],
							},
							then: {
								properties: {
									bearerFormat: {
										type: "string",
									},
								},
							},
						},
						"type-oauth2": {
							if: {
								properties: {
									type: {
										const: "oauth2",
									},
								},
								required: ["type"],
							},
							then: {
								properties: {
									flows: {
										$ref: "#/$defs/oauth-flows",
									},
								},
								required: ["flows"],
							},
						},
						"type-oidc": {
							if: {
								properties: {
									type: {
										const: "openIdConnect",
									},
								},
								required: ["type"],
							},
							then: {
								properties: {
									openIdConnectUrl: {
										type: "string",
										format: "uri",
									},
								},
								required: ["openIdConnectUrl"],
							},
						},
					},
				},
				"security-scheme-or-reference": {
					if: {
						type: "object",
						required: ["$ref"],
					},

					then: {
						$ref: "#/$defs/reference",
					},
					else: {
						$ref: "#/$defs/security-scheme",
					},
				},
				"oauth-flows": {
					type: "object",
					properties: {
						implicit: {
							$ref: "#/$defs/oauth-flows/$defs/implicit",
						},
						password: {
							$ref: "#/$defs/oauth-flows/$defs/password",
						},
						clientCredentials: {
							$ref: "#/$defs/oauth-flows/$defs/client-credentials",
						},
						authorizationCode: {
							$ref: "#/$defs/oauth-flows/$defs/authorization-code",
						},
					},
					$ref: "#/$defs/specification-extensions",
					unevaluatedProperties: false,
					$defs: {
						implicit: {
							type: "object",
							properties: {
								authorizationUrl: {
									type: "string",
									format: "uri",
								},
								refreshUrl: {
									type: "string",
									format: "uri",
								},
								scopes: {
									$ref: "#/$defs/map-of-strings",
								},
							},
							required: ["authorizationUrl", "scopes"],
							$ref: "#/$defs/specification-extensions",
							unevaluatedProperties: false,
						},
						password: {
							type: "object",
							properties: {
								tokenUrl: {
									type: "string",
									format: "uri",
								},
								refreshUrl: {
									type: "string",
									format: "uri",
								},
								scopes: {
									$ref: "#/$defs/map-of-strings",
								},
							},
							required: ["tokenUrl", "scopes"],
							$ref: "#/$defs/specification-extensions",
							unevaluatedProperties: false,
						},
						"client-credentials": {
							type: "object",
							properties: {
								tokenUrl: {
									type: "string",
									format: "uri",
								},
								refreshUrl: {
									type: "string",
									format: "uri",
								},
								scopes: {
									$ref: "#/$defs/map-of-strings",
								},
							},
							required: ["tokenUrl", "scopes"],
							$ref: "#/$defs/specification-extensions",
							unevaluatedProperties: false,
						},
						"authorization-code": {
							type: "object",
							properties: {
								authorizationUrl: {
									type: "string",
									format: "uri",
								},
								tokenUrl: {
									type: "string",
									format: "uri",
								},
								refreshUrl: {
									type: "string",
									format: "uri",
								},
								scopes: {
									$ref: "#/$defs/map-of-strings",
								},
							},
							required: ["authorizationUrl", "tokenUrl", "scopes"],
							$ref: "#/$defs/specification-extensions",
							unevaluatedProperties: false,
						},
					},
				},
				"security-requirement": {
					$comment:
						"https://spec.openapis.org/oas/v3.1#security-requirement-object",
					type: "object",
					additionalProperties: {
						type: "array",
						items: {
							type: "string",
						},
					},
				},
				"specification-extensions": {
					$comment:
						"https://spec.openapis.org/oas/v3.1#specification-extensions",
					patternProperties: {
						"^x-": true,
					},
				},
				examples: {
					properties: {
						example: true,
						examples: {
							type: "object",
							additionalProperties: {
								$ref: "#/$defs/example-or-reference",
							},
						},
					},
				},
				"map-of-strings": {
					type: "object",
					additionalProperties: {
						type: "string",
					},
				},
				"styles-for-form": {
					if: {
						properties: {
							style: {
								const: "form",
							},
						},
						required: ["style"],
					},
					then: {
						properties: {
							explode: {
								default: true,
							},
						},
					},
					else: {
						properties: {
							explode: {
								default: false,
							},
						},
					},
				},
			},
		});
		validate({
			value: {
				description: "Successful response",
				content: {
					"application/json": {
						schema: {
							type: "array",
							items: {
								$ref: "#/components/schemas/Todo",
							},
						},
						examples: {
							example1: {
								summary: "First request",
								value: [],
								// "x-example-scenario-name": "test-x1",
								// "x-example-step-number": 1,
							},
							example2: {
								summary: "Fifth request",
								value: [
									{
										id: "CFDE_juMMdTCKuGQjeetN",
										title: "foo",
										completed: false,
									},
									{
										id: "TtyhMHMjLNZjGNvi46PUJ",
										title: "foo",
										completed: false,
									},
									{
										id: "VM97UHv04Ge_vM8SCIP97",
										title: "foo",
										completed: false,
									},
								],
								// "x-example-scenario-name": "test-x1",
								// "x-example-step-number": 5,
							},
						},
					},
				},
			},
			components: {
				schemas: {
					Todo: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "Unique identifier of the todo",
							},
							title: {
								type: "string",
								description: "Title of the todo",
							},
							completed: {
								type: "boolean",
								description: "Indicates if the todo is completed",
							},
						},
						required: ["id", "title", "completed"],
					},
				},
			},
		});
		expect(validate.errors).toBeNull();
	});
});
