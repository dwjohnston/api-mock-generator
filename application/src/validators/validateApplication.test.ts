import { describe, it, expect } from "bun:test";
import { runApplication } from "../mockServer/runApplication";
import { validTodo1 } from "../_testFixtures/programs/validTodo1";
import { validateApplication } from "./validateApplication";
import { getPostGet } from "../_testFixtures/recordedApis/todos/1_getPostGet";

describe("validateApplication", () => {
	it("should validate the application", async () => {
		const result = await new Promise<ReturnType<typeof validateApplication>>(
			(res, rej) => {
				runApplication(
					validTodo1,
					3002,
					async () => {
						const result = validateApplication(
							getPostGet,
							"http://localhost:3002",
						);
						res(result);
					},
					{
						generateRandomNumber: () => {
							return 1;
						},
						generateRandomString: () => {
							return "abcd1234";
						},
						getCurrentDate: () => {
							return new Date(1);
						},
					},
				);
			},
		);

		console.log(result);
		expect(result.length).toBe(0);
	});
});
