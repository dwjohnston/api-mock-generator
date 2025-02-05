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
			statusCode: 200,
			body: '{"id":"RLfZkYOM9i_S5I8uCna2w","title":"foo","completed":false}',
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
			body: '[{"id":"RLfZkYOM9i_S5I8uCna2w","title":"foo","completed":false}]',
		},
	},
];
