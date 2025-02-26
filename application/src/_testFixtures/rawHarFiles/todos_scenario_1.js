// ❌ - This HAR is invalid, it does not include postData 
//
// GET /todos
// POST /todos x 3 
// GET /todos
// GET /todos/:id x 2

export default {
	"log": {
		"version": "1.2",
		"creator": {
			"name": "ProxyServer",
			"version": "1.0"
		},
		"entries": [
			{
				"startedDateTime": "2025-02-21T05:57:53.185Z",
				"cache": {},
				"request": {
					"method": "GET",
					"url": "http://localhost:3000/todos",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 200,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:57:52 GMT"
						},
						{
							"name": "content-length",
							"value": "2"
						}
					],
					"content": {
						"size": 2,
						"text": "[]",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 2,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 2
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:02.527Z",
				"cache": {},
				"request": {
					"method": "POST",
					"url": "http://localhost:3000/todos",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 201,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:02 GMT"
						},
						{
							"name": "content-length",
							"value": "62"
						}
					],
					"content": {
						"size": 62,
						"text": "{\"id\":\"CFDE_juMMdTCKuGQjeetN\",\"title\":\"foo\",\"completed\":false}",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 1,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 1
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:04.242Z",
				"cache": {},
				"request": {
					"method": "POST",
					"url": "http://localhost:3000/todos",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 201,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:03 GMT"
						},
						{
							"name": "content-length",
							"value": "62"
						}
					],
					"content": {
						"size": 62,
						"text": "{\"id\":\"TtyhMHMjLNZjGNvi46PUJ\",\"title\":\"foo\",\"completed\":false}",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 1,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 1
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:06.389Z",
				"cache": {},
				"request": {
					"method": "POST",
					"url": "http://localhost:3000/todos",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 201,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:06 GMT"
						},
						{
							"name": "content-length",
							"value": "62"
						}
					],
					"content": {
						"size": 62,
						"text": "{\"id\":\"VM97UHv04Ge_vM8SCIP97\",\"title\":\"foo\",\"completed\":false}",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 1,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 1
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:10.962Z",
				"cache": {},
				"request": {
					"method": "GET",
					"url": "http://localhost:3000/todos",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 200,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:10 GMT"
						},
						{
							"name": "content-length",
							"value": "190"
						}
					],
					"content": {
						"size": 190,
						"text": "[{\"id\":\"CFDE_juMMdTCKuGQjeetN\",\"title\":\"foo\",\"completed\":false},{\"id\":\"TtyhMHMjLNZjGNvi46PUJ\",\"title\":\"foo\",\"completed\":false},{\"id\":\"VM97UHv04Ge_vM8SCIP97\",\"title\":\"foo\",\"completed\":false}]",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 2,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 2
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:19.638Z",
				"cache": {},
				"request": {
					"method": "GET",
					"url": "http://localhost:3000/todos/CFDE_juMMdTCKuGQjeetN",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 200,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:19 GMT"
						},
						{
							"name": "content-length",
							"value": "62"
						}
					],
					"content": {
						"size": 62,
						"text": "{\"id\":\"CFDE_juMMdTCKuGQjeetN\",\"title\":\"foo\",\"completed\":false}",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 1,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 1
				}
			},
			{
				"startedDateTime": "2025-02-21T05:58:29.136Z",
				"cache": {},
				"request": {
					"method": "GET",
					"url": "http://localhost:3000/todos/TtyhMHMjLNZjGNvi46PUJ",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [],
					"queryString": [],
					"headersSize": -1,
					"bodySize": -1
				},
				"response": {
					"status": 200,
					"statusText": "",
					"httpVersion": "HTTP/1.1",
					"cookies": [],
					"headers": [
						{
							"name": "content-type",
							"value": "text/plain;charset=utf-8"
						},
						{
							"name": "date",
							"value": "Fri, 21 Feb 2025 05:58:28 GMT"
						},
						{
							"name": "content-length",
							"value": "62"
						}
					],
					"content": {
						"size": 62,
						"text": "{\"id\":\"TtyhMHMjLNZjGNvi46PUJ\",\"title\":\"foo\",\"completed\":false}",
						"mimeType": "text/plain;charset=utf-8"
					},
					"redirectURL": "",
					"headersSize": -1,
					"bodySize": -1
				},
				"time": 0,
				"timings": {
					"send": 0,
					"wait": 0,
					"receive": 0
				}
			}
		]
	}
}
