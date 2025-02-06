# api-mock-generator 

This is an attempt at creating a mock server based on observing real world application usage. 

See this post for motivation: https://blacksheepcode.com/posts/the_tool_i_want_to_exist

## Usage


The main application is in the `application` directory. Navigate there. 

You will  need to set up an `OPENAI_API_KEY` in a `.env` file. 

Start application with: 

```
bun src/index.ts --target=https://your-api.com
```
Press any key to start proxy server. 
This will start a proxy server on localhost:3001

Make requests against this proxy using a tool like curl or Postman (don't use your browser, currently this will fail on fetching anything that doesn't provide a json response). 

When you are done, press any key to have the tool generate a reproduction. 

If things fail, look in the logs. 

