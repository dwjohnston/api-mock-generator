import type { ErrorType, RecordedApiRequests } from ".";

import { getPostGet } from "./testFixtures/recordedApis/todos/1_getPostGet";
import { validTodo1 } from "./testFixtures/programs/validTodo1";

function strForAi(value: unknown): string {
	return `
\`\`\`
${JSON.stringify(value, null, 2)}
\`\`\`  
`;
}

export const prompts = {
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

	errorFeedbackPrompt: (errors: Array<ErrorType>): string => {
		return `
The provided configuration had the following errors: 

\`\`\`
${JSON.stringify(errors, null, 2)}
\`\`\`
`;
	},
};
