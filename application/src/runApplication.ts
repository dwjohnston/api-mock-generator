import Elysia from "elysia";
import type { RouteSchema } from "./routeSchema";

const defaultExternalFunctions = {
	generateRandomNumber: (min = 0, max = 1, step = 1): number => {
		const range = max - min;
		const random = Math.random() * range + min;
		return Math.round(random / step) * step;
	},

	generateRandomString: (
		length = 10,
		characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
	): string => {
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length),
			);
		}
		return result;
	},

	getCurrentDate: (): Date => {
		return new Date();
	},
};

/**
 *
 * @param routeSchema
 * @param onRun  - What to do when the application starts running
 */
export async function runApplication(
	routeSchema: RouteSchema,
	port: number,

	onRun?: (app: Elysia) => void,
	externalFunctions = defaultExternalFunctions,
) {
	const app = new Elysia();

	// biome-ignore lint/style/useConst: The eval will use this
	let globalObject = {};
	const { generateRandomNumber, generateRandomString, getCurrentDate } =
		externalFunctions;
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
