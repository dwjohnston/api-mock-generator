import { z } from "zod";

export const routeSchema = z.object({
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

export type RouteSchema = z.infer<typeof routeSchema>;
