import type { Har } from "har-format";
import openApiSpec from "../../specs/open-api-v3.1-2024-11-14-ajv-fix.json";
import { prompts } from "../../prompts/prompts";

import Ajv from "ajv/dist/2020";
import { iterate } from "../../openAiHelpers/iterate";
import type { OpenApiSpec } from "../../types/types";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(openApiSpec);

export async function harToOpenApi(
	har: Har,
	scenarioName?: string,
): Promise<{
	isSuccess: boolean;
	content: OpenApiSpec;
}> {
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
				validationFunction: async (content: unknown) => {
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

	return result;
}
