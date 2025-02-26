import type { Har } from "har-format";
import openApiSpec from "../../specs/open-api-v3.1-2024-11-14-ajv-fix.json";
import { prompts } from "../../prompts/prompts";

import Ajv from "ajv/dist/2020";
import { iterate } from "../../openAiHelpers/iterate";
import type { OpenApiSpec } from "../../types/types";
import { apiProgram, type ApiProgram } from "../../types/routeSchema";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { runApplication } from "../../mockServer/runApplication";
import { validateApplication } from "../../validators/validateApplication";
import { createExternalFunctions } from "../../mockServer/createExternalFunctions";
import type { ApiProgramValidationError } from "../..";

const ajv = new Ajv({ strict: false }); // options can be passed, e.g. {allErrors: true}
const validate = ajv.compile(openApiSpec);

export async function openApiToProgram(
	openApiSpec: OpenApiSpec,
	harFile: Har,
	validationPort?: number,
): Promise<{
	isSuccess: boolean;
	content: ApiProgram;
}> {
	const result = await iterate<ApiProgram>({
		iterationName: "openApiToProgram",
		basePrompt: prompts.openapiToProgramPrompt(openApiSpec),
		baseResponseFormat: zodResponseFormat(apiProgram, "route_schema"),
		maxIterations: 5,
		validators: [
			{
				validationName: "API test",
				validationFunction: async (content: unknown, iterationNumber) => {
					return new Promise((res, rej) => {
						const program = apiProgram.parse(content);
						const externalFunctions = createExternalFunctions(harFile);
						runApplication(
							program,
							validationPort,
							async (app) => {
								try {
									console.log(
										`📽 Running validation application on port: ${validationPort} for iteration #${iterationNumber}`,
									);

									const errs = await validateApplication(
										harFile,
										`http://localhost:${validationPort}`,
									);

									app.stop(true);

									if (errs.length > 0) {
										res(prompts.openapiToProgramErrorFeedbackPrompt(errs));
									}

									res(null);
								} catch (err) {
									rej(err);
								}
							},
							externalFunctions,
						);
					});
				},
				validationResponseFormat: zodResponseFormat(apiProgram, "route_schema"),
			},
		],
	});

	return result;
}
