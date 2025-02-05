import { createServer, IncomingMessage, ServerResponse } from "node:http";
import httpProxy from "http-proxy";
import { HttpsProxyAgent } from "https-proxy-agent";
import { stdin } from "node:process";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { prompts } from "./src/prompts";
import { routeSchema, type RouteSchema } from "./src/routeSchema";
import { mkdir, writeFile } from "node:fs/promises";
import { format } from "date-fns";
import path from "node:path";
import { dumpDebugInfo } from "./src/dumpDebugInfo";
import { runApplication } from "./src/runApplication";
import { validateApplication } from "./src/validateApplication";

async function prompt(message: string) {
	return new Promise((resolve) => {
		console.log(message);
		stdin.once("data", () => resolve(null));
	});
}
export type RecordedApiRequests = Array<{
	request: {
		url?: string;
		method?: string;
		body?: string;
	};
	response: {
		statusCode?: number;
		body?: string;
	};
}>;
const data = [] as RecordedApiRequests;

async function main() {
	//   console.clear();
	await prompt("Press Enter to start recording...");

	console.log("Recording started...");
	const close = record();
	await prompt("Press Enter to switch to replay mode...");

	console.log("Switched to replay mode.");
	replay();
}

function record() {
	const proxy = httpProxy.createProxyServer({
		target: "http://localhost:3000",
		changeOrigin: true,
	});
	const requestMap = new Map();

	proxy.on("proxyReq", (proxyReq, req, res) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk;
		});
		req.on("end", () => {
			requestMap.set(req, body);
		});
	});

	proxy.on("proxyRes", (proxyRes, req, res) => {
		let responseBody = "";
		proxyRes.on("data", (chunk) => {
			responseBody += chunk;
		});
		proxyRes.on("end", () => {
			const requestBody = requestMap.get(req) || "";
			data.push({
				request: {
					url: req.url,
					method: req.method,
					//   headers: req.headers,
					body: requestBody,
				},
				response: {
					statusCode: proxyRes.statusCode,
					//   headers: proxyRes.headers,
					body: responseBody,
				},
			});
			requestMap.delete(req);
		});
	});

	const server = createServer((req, res) => {
		proxy.web(req, res, (err) => {
			console.error("Proxy error:", err);
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end("Proxy error occurred");
		});
	});

	server.listen(3001, () => {
		console.log("Proxy server running on http://localhost:3001");
	});

	return () => {
		server.close();
	};
}

export type ConversationHistory =
	Array<OpenAI.Chat.Completions.ChatCompletionMessageParam>;

const aiName = "openai";
const VALIDATION_PORT = 3002;

const maxIterations = 5;

export type ErrorType = {
	requestNumber: number;
	requestData: RecordedApiRequests[number]["request"];
	expectedResponse: RecordedApiRequests[number]["response"];
	actualResponse: {
		statusCode: number;
		body: string;
	};
};

async function validateResponse(
	response: string,
	iterationNumber: number,
): Promise<
	| {
			isValid: true;
			program: RouteSchema;
	  }
	| {
			isValid: false;
			errors: Array<ErrorType>;
			program: RouteSchema;
	  }
> {
	return new Promise((res, rej) => {
		const openAiResponse = routeSchema.parse(JSON.parse(response));
		runApplication(openAiResponse, VALIDATION_PORT, async (app) => {
			console.log(
				`Running validation application on port: ${VALIDATION_PORT} for iteration #${iterationNumber}`,
			);

			const errs = await validateApplication(
				data,
				`http://localhost:${VALIDATION_PORT}`,
			);

			app.stop(true);

			if (errs.length > 0) {
				console.log("Encountered errs:", errs);
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
		});
	});
}

function createIterate(openai: OpenAI, data: RecordedApiRequests) {
	return async function iterate(
		conversationHistory: ConversationHistory,
	): Promise<
		{
			success: boolean;
			program: RouteSchema;
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

		if (conversationHistory.length < maxIterations) {
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

async function replay() {
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

	await dumpDebugInfo(
		data,
		result.program,
		result.conversationHistory,
		result.success ? null : result.errors,
	);

	runApplication(result.program, VALIDATION_PORT, () => {
		console.log(`Running final application on port: ${VALIDATION_PORT}`);
	});
}

main();
