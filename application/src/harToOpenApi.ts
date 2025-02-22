import { generateSpec } from "har-to-openapi";
import har from "./testFixtures/rawHarFiles/recording-2025-02-20T05-45-45-712Zmod.json";
import fs from "node:fs";
import type { Har } from "har-format";
import OpenAI from "openai";
import type { ConversationHistory } from ".";
import openApiSpec from "./specs/open-api-v3.1-2024-11-14-with-extensions.json";
import type { ResponseFormatJSONSchema } from "openai/resources/shared.mjs";
import { prompts } from "./prompts";
import { writeTestLog } from "./testUtils/writeTestLog";
import { prevalidateJsonSchema } from "./openAiHelpers/prevalidateJsonSchema";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import Ajv from "ajv/dist/2020";
import { iterate } from "./openAiHelpers/iterate";

// TODO Get this type when we can see:
// https://github.com/bcherny/json-schema-to-typescript/issues/626
// Also:
//https://stackoverflow.com/questions/79158453/use-openapi-3-1-schema-to-validate-an-openapi-spec
type OpenApiSpec = unknown;

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(openApiSpec);

export async function harToOpenApi(
	har: Har,
	scenarioName?: string,
): Promise<OpenApiSpec> {
	const result = await iterate({
		iterationName: "harToOpenApi",
		basePrompt: prompts.harPrompt(har, scenarioName),
		baseResponseFormat: {
			type: "json_object",
		},
		maxIterations: 5,
		validators: [
			{
				validationName: "AJV",
				validationFunction: (content: unknown) => {
					validate(content);
					if (validate.errors) {
						return prompts.ajvValidationErrorPrompt(validate.errors);
					}
					return null;
				},
				validationResponseFormat: {
					type: "json_object",
				},
			},
		],
	});

	return result.parsedContent;
}
