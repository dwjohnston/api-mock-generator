import type { RouteSchema } from "../../routeSchema";

export const validTodo1 = {
	setup: "globalObject.todos = [];",
	routes: [
		{
			method: "get",
			url: "/todos",
			fn: "async () => globalObject.todos",
		},
		{
			method: "post",
			url: "/todos",
			fn: "async ({ body }) => { console.log('app',body); const todo = body; if (typeof todo.title !== 'string' || typeof todo.completed !== 'boolean') { return { statusCode: 400, error: 'Validation error' }; } todo.id = Math.random().toString(36).substring(2, 15); globalObject.todos.push(todo); return todo; }",
		},
	],
} satisfies RouteSchema;
