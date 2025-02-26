import OpenAI from "openai";
import type { ConversationHistory } from "..";
import type { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs";
import { writeTestLog } from "../testUtils/writeTestLog";

type IterationValidator = {
	validationName: string;
	validationFunction: (
		content: unknown,
		iterationNumber: number,
	) => Promise<string | null>;
	validationResponseFormat: ChatCompletionCreateParamsBase["response_format"];
};

type IterationConfig = {
	iterationName: string;
	basePrompt: string;
	baseResponseFormat: ChatCompletionCreateParamsBase["response_format"];
	maxIterations: number;
	validators: Array<IterationValidator>;
};

export async function iterate<T>(config: IterationConfig): Promise<{
	isSuccess: boolean;
	content: T;
}> {
	const openai = new OpenAI();
	const conversationHistory = [] as ConversationHistory;
	conversationHistory.push({
		role: "developer",
		content: config.basePrompt,
	});

	console.log("💬 Sending conversation to AI #0");
	const response = await openai.chat.completions.create({
		// Important, solves this bug:
		// https://community.openai.com/t/function-json-schema-is-still-ignored-by-gpt-4-4o-and-4o-mini-when-calling-tools/895368/2
		model: "gpt-4o-2024-08-06",
		response_format: config.baseResponseFormat,
		messages: conversationHistory,
	});
	console.log("💬 Received response from AI #0");

	conversationHistory.push(response.choices[0].message);

	let parsedContent = JSON.parse(
		response.choices[0].message.content as string,
	) as T;

	writeTestLog(`${config.iterationName}_0_openai_response`, response);
	writeTestLog(
		`${config.iterationName}_0_openai_response_content`,
		parsedContent,
	);

	let isSuccess = true;
	for (let i = 1; i <= config.maxIterations; i++) {
		console.log(`🔄 Iterating ${config.iterationName} #${i}`);
		isSuccess = true;
		for (const validator of config.validators) {
			console.log(
				`🔍 Validating ${validator.validationName} for ${config.iterationName} #${i}`,
			);

			const validationResponse = await validator.validationFunction(
				parsedContent,
				i,
			);
			if (!validationResponse) {
				console.log(
					`✅ ${validator.validationName} is valid for ${config.iterationName} #${i}`,
				);
				continue;
			}
			writeTestLog(
				`${config.iterationName}_${i}_validation_error_${validator.validationName}_iteration`,
				validationResponse,
			);

			isSuccess = false;

			console.log(
				`❌ ${validator.validationName} is invalid for ${config.iterationName} #${i}`,
			);
			conversationHistory.push({
				role: "developer",
				content: validationResponse,
			});

			console.log(`💬 Sending conversation to AI #${i}`);
			const response = await openai.chat.completions.create({
				// Important, solves this bug:
				// https://community.openai.com/t/function-json-schema-is-still-ignored-by-gpt-4-4o-and-4o-mini-when-calling-tools/895368/2
				model: "gpt-4o-2024-08-06",
				response_format: validator.validationResponseFormat,
				messages: conversationHistory,
			});
			console.log(`💬 Received response from AI #${i}`);

			conversationHistory.push(response.choices[0].message);
			parsedContent = JSON.parse(response.choices[0].message.content as string);
			writeTestLog(`${config.iterationName}_${i}_response`, response);
			writeTestLog(
				`${config.iterationName}_${i}_response_content`,
				parsedContent,
			);

			// We do not continue with the validations if the response is invalid,
			// Instead that counts as a failed iteration
			break;
		}

		if (isSuccess) {
			break;
		}
	}

	writeTestLog(
		`${config.iterationName}_conversation_history`,
		conversationHistory,
	);

	return {
		isSuccess: isSuccess,
		content: parsedContent,
	};
}
