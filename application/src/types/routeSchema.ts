import { z } from "zod";

export const apiProgram = z.object({
	setup: z.string(),
	routes: z.array(
		z.object({
			method: z.enum([
				"get",
				"post",
				"put",
				"delete",
				"patch",
				"options",
				"head",
			]),
			url: z.string(),
			fn: z.string(),
		}),
	),
});

export type ApiProgram = z.infer<typeof apiProgram>;
