import type { ApiProgram } from "../../types/routeSchema";

export const validTodo1 = {
	setup: "globalObject.todos = [];",
	routes: [
		{
			method: "get",
			url: "/todos",
			fn: "async () => {return new Response(JSON.stringify(globalObject.todos), { status: 200 });}",
		},
		{
			method: "post",
			url: "/todos",
			fn: "async ({ body }) => { const newTodo = {...body}; newTodo.id=generateRandomString(8); globalObject.todos.push(newTodo); return new Response(JSON.stringify(newTodo), { status: 201 }); }",
		},
	],
} satisfies ApiProgram;
