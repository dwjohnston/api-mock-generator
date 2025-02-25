import type { Har } from "har-format";
import openApiSpec from "../../specs/open-api-v3.1-2024-11-14-ajv-fix.json";
import { prompts } from "../../prompts";

import Ajv from "ajv/dist/2020";
import { iterate } from "../../openAiHelpers/iterate";
import type { OpenApiSpec } from "../../types/types";
import { apiProgram, type ApiProgram } from "../../types/routeSchema";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(openApiSpec);

export async function openApiToProgram(
	openApiSpec: OpenApiSpec,
): Promise<ApiProgram> {
	const result = await iterate({
		iterationName: "openApiToProgram",
		basePrompt: prompts.openapiToProgramPrompt(openApiSpec),
		baseResponseFormat: zodResponseFormat(apiProgram, "route_schema"),
		maxIterations: 5,
		validators: [
			{
				validationName: "API test",
				validationFunction: (content: unknown) => {
					validate(content);
					if (validate.errors) {
						return prompts.ajvValidationErrorPrompt(validate.errors);
					}
					return null;
				},
				validationResponseFormat: zodResponseFormat(apiProgram, "route_schema"),
			},
		],
	});

	return result.parsedContent;
}
