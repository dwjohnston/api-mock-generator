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
import { config } from "../../config";
import { writeTestLog } from "../../testUtils/writeTestLog";
import { generateFileName } from "../../testUtils/fileNameGenerator";

export async function openApiToProgram(
	openApiSpec: OpenApiSpec,
	harFile: Har,
	validationPort = config.defaultValidationPort,
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

										//@ts-expect-error
										openApiSpec.servers.map((server) => server.url),
									);

									app.stop(true);

									writeTestLog(
										generateFileName({
											iteration: iterationNumber,
											functionName: "openApiToProgram",
											description: "api_validation_result",
											priority: 0,
										}),
										errs,
									);

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
