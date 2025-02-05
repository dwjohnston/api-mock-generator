import { Elysia } from "elysia";
import { nanoid } from "nanoid";

// Todo type definition
interface Todo {
	id: string;
	title: string;
	completed: boolean;
}

// In-memory database
const db: { todos: Record<string, Todo> } = { todos: {} };

// Database accessor
const dbAccessor = {
	getAll: async (): Promise<Todo[]> => Object.values(db.todos),
	getById: async (id: string): Promise<Todo | null> => db.todos[id] || null,
	create: async (todo: Omit<Todo, "id">): Promise<Todo> => {
		const id = nanoid();
		db.todos[id] = { id, ...todo };
		return db.todos[id];
	},
	update: async (
		id: string,
		updates: Partial<Omit<Todo, "id">>,
	): Promise<Todo | null> => {
		if (!db.todos[id]) return null;
		db.todos[id] = { ...db.todos[id], ...updates };
		return db.todos[id];
	},
	delete: async (id: string): Promise<boolean> => {
		if (!db.todos[id]) return false;
		delete db.todos[id];
		return true;
	},
};

Object.entries(dbAccessor).forEach((v) => {
	const [key, value] = v;

	dbAccessor[key] = async (...args) => {
		await new Promise((res) => setTimeout(() => res(null), 1000));

		return value(...args);
	};
});

const app = new Elysia()
	.get("/todos", async () => {
		const todos = await dbAccessor.getAll();
		return new Response(JSON.stringify(todos), { status: 200 });
	})

	.get("/todos/:id", async ({ params }) => {
		const todo = await dbAccessor.getById(params.id);
		if (!todo) {
			return new Response(JSON.stringify({ error: "Not found" }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(todo), { status: 200 });
	})

	.post("/todos", async ({ body }) => {
		const newTodo = await dbAccessor.create(body as Omit<Todo, "id">);
		return new Response(JSON.stringify(newTodo), { status: 201 });
	})

	.patch("/todos/:id", async ({ params, body }) => {
		const updatedTodo = await dbAccessor.update(
			params.id,
			body as Partial<Omit<Todo, "id">>,
		);
		if (!updatedTodo) {
			return new Response(JSON.stringify({ error: "Not found" }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify(updatedTodo), { status: 200 });
	})

	.delete("/todos/:id", async ({ params }) => {
		const deleted = await dbAccessor.delete(params.id);
		if (!deleted) {
			return new Response(JSON.stringify({ error: "Not found" }), {
				status: 404,
			});
		}
		return new Response(JSON.stringify({ success: true }), { status: 204 });
	})

	.listen(3000);

console.log("Server running on http://localhost:3000");
