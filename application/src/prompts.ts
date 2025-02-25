import type { ErrorType, RecordedApiRequests } from ".";
import { hri } from "human-readable-ids";
import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";
import { validTodo1 } from "./testFixtures/programs/validTodo1";
import type { Har } from "har-format";
import type { ErrorObject } from "ajv";
import type { OpenApiSpec } from "./types/types";

function strForAi(value: unknown): string {
	return `
\`\`\`
${JSON.stringify(value, null, 2)}
\`\`\`  
`;
}

export const prompts = {
	/**
	 * @deprecated
	 */
	basePrompt: (data: RecordedApiRequests): string => `

## Task Brief 

You will be provided a list of API requests and their responses. 
Your task is to provide Elysia API handlers that will reproduce the functionality in the general case. 

Do not implement any non-deterministic functionality. 
The following functions will be available to you: 

\`\`\`
generateRandomNumber(min?: number, max?: number, step?: number) : number;
generateRandomString(length?: number, availableChars?: string): string; 
getCurrentDate(): Date; 
\`\`\`

As well as an empty object called \`globalObject\`.


Your returned object will be used in the a code block like follows: 
\`\`\`
const app = new Elysia();

let resultFromAi; //<-- The object you are providing

let globalObject = {};
const { generateRandomNumber, generateRandomString, getCurrentDate } =
  externalFunctions;

eval(resultFromAi.setup);

resultFromAi.routes.reduce((acc, cur) => {
  app[cur.method](cur.url, eval(cur.fn));
  return app;
}, app);

app.listen(port, () => {
});
\`\`\`


## Examples 

### Scenario 1 - A simple todo app

Input data:

${strForAi(getPostGet)}

A good output: 

${strForAi(validTodo1)};

## Actual data

\`\`\`
${JSON.stringify(data, null, 2)}
\`\`\`
`,

	/**
	 * @deprecated
	 */
	errorFeedbackPrompt: (errors: Array<ErrorType>): string => {
		return `
The provided configuration had the following errors: 

\`\`\`
${JSON.stringify(errors, null, 2)}
\`\`\`
`;
	},

	harPrompt: (har: Har, scenarioName = hri.random()): string => `
	Generate an JSON format OpenAPI 3.1.0 spec from the following HAR file:

${strForAi(har)}

Include \`examples\` using the provided test data. Use \`examples\` and _not_ \`example\`.

Additionally add the following properties to the \`examples\` objects:

-'x-example-scenario-name' 
-'x-example-step-number'

The sequence of requests in the HAR file should be reflected in the additional x-properties.
The first request in the har file will have 'x-example-step-number' set to 1, the second request will have 'x-example-step-number' set to 2, and so on.
All examples should have 'x-example-scenario-name' set to '${scenarioName}'

`,

	ajvValidationErrorPrompt: (
		errors: Array<ErrorObject<string, Record<string, unknown>>>,
	): string => `
	
		According to AJV, the provided JSON is not valid. The errors are as follows:
		${strForAi(errors)}

	`,

	openapiToProgramPrompt: (openApiSpec: OpenApiSpec): string => `
You are provided with an OpenAPI spec. 

Note that this API spec has extensions on the \`examples\` objects.

Each \`examples\` object has the following properties:
- 'x-example-scenario-name'
- 'x-example-step-number'

Your task is to provide a program that will reproduce the functionality in the general case, such that said examples will occur in the correct order. 

You will be creating Elysia API handlers. 

Do not implement any non-deterministic functionality. 
The following functions will be available to you: 

\`\`\`
generateRandomNumber(min?: number, max?: number, step?: number) : number;
generateRandomString(length?: number, availableChars?: string): string; 
getCurrentDate(): Date; 
\`\`\`

As well as an empty object called \`globalObject\`.

Your returned object will be used in the a code block like follows: 
\`\`\`
const app = new Elysia();

let resultFromAi; //<-- The object you are providing

let globalObject = {};
const { generateRandomNumber, generateRandomString, getCurrentDate } =
  externalFunctions;

eval(resultFromAi.setup);

resultFromAi.routes.reduce((acc, cur) => {
  app[cur.method](cur.url, eval(cur.fn));
  return app;
}, app);

app.listen(port, () => {
});
\`\`\`


Your API spec is as follows: 

${strForAi(openApiSpec)}
	
	`,
};
