import Elysia from "elysia";
import type { RouteSchema } from "./routeSchema";

/**
 *
 * @param routeSchema
 * @param onRun  - What to do when the application starts running
 */
export async function runApplication(
	routeSchema: RouteSchema,
	port: number,
	onRun?: (app: Elysia) => void,
) {
	const app = new Elysia();

	// biome-ignore lint/style/useConst: The eval will use this
	let globalObject = {};

	// biome-ignore lint/security/noGlobalEval: I know.
	eval(routeSchema.setup);
	routeSchema.routes.reduce((acc, cur) => {
		// biome-ignore lint/security/noGlobalEval: I know.
		app[cur.method](cur.url, eval(cur.fn));
		return app;
	}, app);

	app.listen(port, () => {
		onRun?.(app);
	});
}
