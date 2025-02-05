export const getPostGet = [
	{
		request: {
			url: "/todos",
			method: "GET",
			body: "",
		},
		response: {
			statusCode: 200,
			body: "[]",
		},
	},
	{
		request: {
			url: "/todos",
			method: "POST",
			body: '{\n    "title": "foo", \n    "completed": false\n}',
		},
		response: {
			statusCode: 201,
			body: '{"id":"abcd1234","title":"foo","completed":false}',
		},
	},
	{
		request: {
			url: "/todos",
			method: "GET",
			body: "",
		},
		response: {
			statusCode: 200,
			body: '[{"id":"abcd1234","title":"foo","completed":false}]',
		},
	},
];
