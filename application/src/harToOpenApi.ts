import { generateSpec } from "har-to-openapi";
import har from "./testFixtures/rawHarFiles/recording-2025-02-20T05-45-45-712Zmod.json";
import fs from "node:fs";
import type { Har } from "har-format";
import OpenAI from "openai";
import type { ConversationHistory } from ".";
import openApiSpec from "./specs/open-api-v3.1-2024-11-14.json";
import type { ResponseFormatJSONSchema } from "openai/resources/shared.mjs";
import { prompts } from "./prompts";

// TODO Get this type when we can see:
// https://github.com/bcherny/json-schema-to-typescript/issues/626
type OpenApiSpec = unknown;

export async function harToOpenApi(har: Har): Promise<OpenApiSpec> {
	const conversationHistory = [] as ConversationHistory;

	conversationHistory.push({
		role: "developer",
		content: prompts.harPrompt(har),
	});

	const openai = new OpenAI();

	const response = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		response_format: {
			type: "json_object",

			// I can't get the structured response to work for an OpenAPI spec
			// See: https://community.openai.com/t/official-documentation-for-supported-schemas-for-response-format-parameter-in-calls-to-client-beta-chats-completions-parse/932422
		},
		messages: conversationHistory,
	});

	return JSON.parse(response.choices[0].message.content as string);
}
