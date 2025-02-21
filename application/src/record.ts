import type { RecordedApiRequests } from ".";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { createServer as createHttpServer } from "node:http";
import type { Entry, Har, Log } from "har-format";
import fsAsync from "node:fs/promises";
import fs from "node:fs";
import { appendEntryAndSaveHar, recorderHarMiddleware } from "harproxyserver";
import httpProxy from "http-proxy";
export async function startRecordServer(
	target: string,
	harOutput: string,
	port = 3001,
): Promise<[() => RecordedApiRequests, url: string]> {
	const proxy = httpProxy.createProxyServer({
		target,
		changeOrigin: true,
	});
	const requestMap = new Map();
	const data = [] as RecordedApiRequests;
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
	const server = createHttpServer((req, res) => {
		//@ts-expect-error
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		proxy.web(req, res, (err: any) => {
			console.error("Proxy error:", err);
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end("Proxy error occurred");
		});
	});
	return new Promise((res) => {
		server.listen(port, () => {
			console.log(`Proxy server running on http://localhost:${port}`);
			res([
				() => {
					server.close();
					return data;
				},
				`http://localhost:${port}`,
			]);
		});
	});
}

export async function startRecordServer2(
	target: string,
	harOutput: string,
	port = 3001,
): Promise<[() => RecordedApiRequests, url: string]> {
	const app = express();

	const middleware = recorderHarMiddleware(
		harOutput,
		appendEntryAndSaveHar,
		target,
	);
	app.use(
		"/",
		createProxyMiddleware({
			target: target,
			changeOrigin: true,
			selfHandleResponse: true,
			on: {
				proxyRes: middleware,
			},
		}),
	);
	const server = createHttpServer(app);
	return new Promise((res) => {
		const listeningUrl = `http://localhost/${port}`;
		server.listen(port, () => {
			console.log(`listening on ${listeningUrl}`);
		});
		res([
			() => {
				server.close();
				console.log(harOutput);
				const data = fs.readFileSync(harOutput, "utf8");
				const harData = JSON.parse(data) as Har;
				return harData.log.entries.map((v) => {
					return {
						request: {
							url: v.request.url,
							method: v.request.method,
							body: v.request.postData?.text,
						},
						response: {
							statusCode: v.response.status,
							body: v.response.content.text,
						},
					};
				});
			},
			listeningUrl,
		]);
	});
}
