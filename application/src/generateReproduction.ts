import OpenAI from "openai";
import { prompts } from "./prompts";
import { runApplication } from "./runApplication";
import { createExternalFunctions } from "./createExternalFunctions";
import {
	type RecordedApiRequests,
	VALIDATION_PORT,
	type ErrorType,
	type ConversationHistory,
	aiName,
	maxIterations,
} from ".";
import {
	type ApiProgramRouteConfiguration,
	routeSchema,
} from "./types/routeSchema";
import { validateApplication } from "./validateApplication";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export function createIterate(openai: OpenAI, data: RecordedApiRequests) {
	async function validateResponse(
		response: string,
		iterationNumber: number,
	): Promise<
		| {
				isValid: true;
				program: ApiProgramRouteConfiguration;
		  }
		| {
				isValid: false;
				errors: Array<ErrorType>;
				program: ApiProgramRouteConfiguration;
		  }
	> {
		return new Promise((res, rej) => {
			const openAiResponse = routeSchema.parse(JSON.parse(response));
			const externalFunctions = createExternalFunctions(data);

			console.log(openAiResponse);

			runApplication(
				openAiResponse,
				VALIDATION_PORT,
				async (app) => {
					try {
						console.log(
							`Running validation application on port: ${VALIDATION_PORT} for iteration #${iterationNumber}`,
						);

						const errs = await validateApplication(
							data,
							`http://localhost:${VALIDATION_PORT}`,
						);

						app.stop(true);

						if (errs.length > 0) {
							res({
								isValid: false,
								errors: errs,
								program: openAiResponse,
							});
						}

						res({
							isValid: true,
							program: openAiResponse,
						});
					} catch (err) {
						rej(err);
					}
				},
				externalFunctions,
			);
		});
	}

	return async function iterate(
		conversationHistory: ConversationHistory,
	): Promise<
		{
			success: boolean;
			program: ApiProgramRouteConfiguration;
			conversationHistory: ConversationHistory;
		} & (
			| {
					success: true;
			  }
			| {
					success: false;
					errors: Array<ErrorType>;
			  }
		)
	> {
		const conversationLength = Math.floor(conversationHistory.length / 2);
		console.log(
			`💬 Sending conversation to ${aiName} #${conversationLength + 1}`,
		);
		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			response_format: zodResponseFormat(routeSchema, "route_schema"),
			messages: conversationHistory,
		});
		console.log(`📩 Got reply from ${aiName} #${conversationLength + 1}`);

		if (!response.choices[0].message.content) {
			throw new Error("OpenAI did not return a string response.");
		}

		conversationHistory.push({
			role: "assistant" as const,
			content: response.choices[0].message.content,
		});

		const result = await validateResponse(
			response.choices[0].message.content,
			conversationHistory.length + 1,
		);

		if (result.isValid) {
			return {
				success: true,
				program: result.program,
				conversationHistory,
			};
		}

		if (conversationHistory.length < maxIterations * 2) {
			conversationHistory.push({
				role: "developer" as const,
				content: prompts.errorFeedbackPrompt(result.errors),
			});
			return await iterate(conversationHistory);
		}

		return {
			success: false,
			program: result.program,
			conversationHistory,
			errors: result.errors,
		};
	};
}
export async function generateReproduction(data: RecordedApiRequests) {
	const conversationHistory = [];

	const openai = new OpenAI();
	const iterate = createIterate(openai, data);

	conversationHistory.push({
		role: "developer" as const,
		content: prompts.basePrompt(data),
	});

	const result = await iterate(conversationHistory);

	if (result.success) {
		console.log(`
✅ Success! After ${result.conversationHistory.length / 2} iterations.

Application passed validation. 
`);
	} else {
		//TODO: There are multiple reasons it could fail, need to have good messaging here.
		console.log(`
❌ Failure!
`);
	}
	const externalFunctions = createExternalFunctions(data);

	runApplication(
		result.program,
		VALIDATION_PORT,
		() => {
			console.log(`Running final application on port: ${VALIDATION_PORT}`);
		},
		externalFunctions,
	);

	return {
		data,
		program: result.program,
		conversationHistory: result.conversationHistory,
		errors: result.success ? null : result.errors,
	};
}
