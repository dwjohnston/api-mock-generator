## Resources: 

- harproxyserver - https://github.com/yaacov/harproxyserver


https://editor-next.swagger.io/

## Approach 1 - Custom formats both ways 

Approach one had me sending data like this: 

```js
[
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
	}
]
```

And receiving data like this: 

```js
{
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
}
```

_This actually worked quite well_ 


## Approach 2 - HAR to OpenAPI Spec (non-ai)

In approach 2 I used pre-existing har files. (Recorded with harproxyserver) and tried converting them with a couple of tools: 

- https://github.com/jonluca/har-to-openapi
- https://github.com/anbuksv/avantation

Both of these suffered the same problem - they wouldn't generalise `GET todos/1` and `GET todos/2` to a single `GET todos/{id}` endpoint. 

## Approach 3 - HAR to OpenAPI Spec (ai based) 

Then I tried getting AI to generate an OpenAPI spec  based on the har file. First glance it looks like it works but:  

### Approach 3a - non JSON-schema output 

I'm using the 

```
		baseResponseFormat: {
			type: "json_object",
		},
```


#### Not so much of a problem - differing content types 

My example HAR has the response content type being `text/plain`. 

The AI would alternate between speccing it as `text/plain`, `text/plain;charset=utf8` and `application/json`. 

#### More a problem, invalid specs 

It would sometime return me a spec like this: 


//TODO 
```

```

### Approach 3b - Structured outputs 

So then I figured that's where [structured outputs](https://platform.openai.com/docs/guides/structured-outputs) would work well. 

I get the JSON Spec from OpenAPI here https://spec.openapis.org/#non-normative-json-schemas

_The problem is - [OpenAI only supports a subset of JSON Schema_](https://platform.openai.com/docs/guides/structured-outputs?example=moderation&format=without-parse&lang=node.js#supported-schemas) 

I try paring the schema down, but I'm ultimately unsuccessful.

It ends up coming down to bits of like this: 

```
		"examples": {
			"properties": {
				"example": true,
				"examples": {
					"type": "object",
					"additionalProperties": {
						"$ref": "#/$defs/example-or-reference"
					}
				}
			}
		},
```

Where additionalProperties is one of properties that is not supported (it needs to be false). 

It doesn't help that the error messages from OpenAI are not particularly descriptive. [See my issue here](https://community.openai.com/t/improve-the-error-messages-for-json-schema-structured-output).

However, yet explored is I could possibly hand write a JSON schema that matches enough of a subset of the OpenAPI spec, removing these `example-or-reference` type refs. 

### Approach 3c - non JSON schema validation, but with AJV feedback 

In this approach I abandon using JSON Schema response format, but apply AJV validation, using the raw JSON Schema spec, and then feedback any validation errors to the AI. 

This doesn't work. 

We get a flow like this. 

See `preservedLogs/ajv-failure` for this example. 

This appears to be AJV erroneously or too strictly failing the schema. AFAICT the AI's response is valid. 


Tracked this down to the `$dynamicRef` playing up, see this issue: 
https://github.com/ajv-validator/ajv/issues/1573#issuecomment-1862390739









