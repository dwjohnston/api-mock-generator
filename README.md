# api-mock-generator 

This is an attempt at creating a mock server based on observing real world application usage. 

See this post for motivation: https://blacksheepcode.com/posts/the_tool_i_want_to_exist

## Recording HAR files 

1. Start [mitmproxy](https://mitmproxy.org/) running

```
mitmproxy
```

2. Start the sample-api

```
bun run start:sample-api
```


3. Start the proxy running 

```
bun run start:proxy-server
```


4. Make your requests against `http://localhost:3001`

5. In mitm proxy, run the command

```
har.save @all proxyRecords/har.json
```

6 You can preserve your recording with 

```
bun run copy-har "scenario-name"
```

