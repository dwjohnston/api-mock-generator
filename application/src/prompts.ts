import { error } from "elysia";
import type { ErrorType, RecordedApiRequests } from "..";

export const prompts = {
	basePrompt: (data: RecordedApiRequests): string => `
    Here is an example series of API requests and responses: 

    [
      {
        request: {
          method: "POST",
          body: "{\n    \"title\": \"111\", \n    \"completed\": false\n    \n}",
        },
        response: {
          statusCode: 200,
          body: "{\"id\":\"udCQnHwiIdHFSQceYXOEy\",\"title\":\"111\",\"completed\":false}",
        },
      }, {
        request: {
          method: "POST",
          body: "{\n    \"title\": \"111\", \n    \"completed\": false\n    \n}",
        },
        response: {
          statusCode: 200,
          body: "{\"id\":\"2qlhb6nGFlwxe_Up39L4a\",\"title\":\"111\",\"completed\":false}",
        },
      }, {
        request: {
          method: "POST",
          body: "{\n    \"title\": \"111\", \n    \"completed\": false\n    \n}",
        },
        response: {
          statusCode: 200,
          body: "{\"id\":\"oU5m9RsGe62_Uy_u_kz9s\",\"title\":\"111\",\"completed\":false}",
        },
      }, {
        request: {
          method: "GET",
          body: "",
        },
        response: {
          statusCode: 200,
          body: "[{\"id\":\"XBXHDsqbwSlM8iYIgACtI\",\"title\":\"aaaa\",\"completed\":false},{\"id\":\"zwb78OllrtKv4qfJ6g36w\",\"title\":\"111\",\"completed\":false},{\"id\":\"CwdE5EHVcU_JFBGmnGcdj\",\"title\":\"111\",\"completed\":false},{\"id\":\"JmrqOOl10W36ByRIM1RHa\",\"title\":\"111\",\"completed\":false},{\"id\":\"Pzb3morymQO-2RxzquWCH\",\"title\":\"111\",\"completed\":false},{\"id\":\"2xAaidE8hdXld6qBLsj5D\",\"title\":\"111\",\"completed\":false},{\"id\":\"udCQnHwiIdHFSQceYXOEy\",\"title\":\"111\",\"completed\":false},{\"id\":\"2qlhb6nGFlwxe_Up39L4a\",\"title\":\"111\",\"completed\":false},{\"id\":\"oU5m9RsGe62_Uy_u_kz9s\",\"title\":\"111\",\"completed\":false}]",
        },
      },
      {
        request: {
          method: "GET",
          body: "",
        },
        response: {
          statusCode: 200,
          body: "[{\"id\":\"XBXHDsqbwSlM8iYIgACtI\",\"title\":\"aaaa\",\"completed\":false},{\"id\":\"zwb78OllrtKv4qfJ6g36w\",\"title\":\"111\",\"completed\":false},{\"id\":\"CwdE5EHVcU_JFBGmnGcdj\",\"title\":\"111\",\"completed\":false},{\"id\":\"JmrqOOl10W36ByRIM1RHa\",\"title\":\"111\",\"completed\":false},{\"id\":\"Pzb3morymQO-2RxzquWCH\",\"title\":\"111\",\"completed\":false},{\"id\":\"2xAaidE8hdXld6qBLsj5D\",\"title\":\"111\",\"completed\":false},{\"id\":\"udCQnHwiIdHFSQceYXOEy\",\"title\":\"111\",\"completed\":false},{\"id\":\"2qlhb6nGFlwxe_Up39L4a\",\"title\":\"111\",\"completed\":false},{\"id\":\"oU5m9RsGe62_Uy_u_kz9s\",\"title\":\"111\",\"completed\":false}]",
        },
      }
    ]
    
    
    A good object response would look like this: 
    
    { 
        setup: () => {
            globalObject.todos = [];
          },
          routes: [
            {
              method: "post",
              url: "/todos",
              fn: "async ({ body }) => { const todo = JSON.parse(body);\n todo.id = Math.random().toString(36).substring(2, 15);\nglobalObject.todos.push(todo);\nreturn todo;\n"                      },
            },
            {
              method: "get",
              url: "/todos",
              fn: "async () => globalObject.todos"
            }
          ],
    }, 

    The actual data to generate code for is as follows: 

\`\`\`
${JSON.stringify(data, null, 2)}
\`\`\`
`,

	errorFeedbackPrompt: (errors: Array<ErrorType>): string => {
		return `
The provided configuration had the following errors: 

\`\`\`
${JSON.stringify(errors, null, 2)}
\`\`\`
`;
	},
};
