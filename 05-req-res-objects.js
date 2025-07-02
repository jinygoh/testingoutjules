const express = require('express');
const path = require('path'); // Node.js path module
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded bodies
// This is crucial for accessing req.body
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Request (req) Object ---
// The req object represents the HTTP request and has properties for the
// request query string, parameters, body, HTTP headers, and so on.

app.all('/inspect-request', (req, res) => {
  // req.method: The HTTP method of the request (GET, POST, PUT, etc.)
  // req.url: The full URL requested (path + query string)
  // req.path: The path part of the request URL (e.g., /inspect-request)
  // req.query: An object containing the parsed query string parameters.
  //            Example: /inspect-request?name=John&age=30 -> req.query = { name: 'John', age: '30' }
  // req.params: An object containing route parameters. (See example below)
  // req.headers: An object containing the request headers.
  // req.body: An object containing the parsed request body (requires middleware like express.json()).
  // req.ip: The remote IP address of the request.
  // req.protocol: The request protocol string: either http or (for TLS requests) https.
  // req.get(headerName): A convenient way to get a request header value (case-insensitive).

  const requestDetails = {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params, // Will be empty for this specific route unless it had params
    headers: req.headers,
    body: req.body,
    ip: req.ip,
    protocol: req.protocol,
    contentTypeHeader: req.get('Content-Type'),
    userAgent: req.get('User-Agent')
  };

  console.log('--- Inspect Request Details ---');
  console.log(JSON.stringify(requestDetails, null, 2));
  console.log('--- End Inspect Request Details ---');

  res.json({
    message: 'Request details logged to server console. Check some common properties below.',
    method: requestDetails.method,
    path: requestDetails.path,
    query: requestDetails.query,
    body: requestDetails.body,
    firstQueryParamValue: Object.keys(req.query).length > 0 ? req.query[Object.keys(req.query)[0]] : undefined
  });
});

// Example route with parameters to demonstrate req.params
app.get('/items/:category/:itemId', (req, res) => {
  // /items/electronics/123 -> req.params = { category: 'electronics', itemId: '123' }
  const category = req.params.category;
  const itemId = req.params.itemId;
  res.send(`Item Category: ${category}, Item ID: ${itemId}. Params object: ${JSON.stringify(req.params)}`);
});


// --- Response (res) Object ---
// The res object represents the HTTP response that an Express app sends when
// it gets an HTTP request.

app.get('/response-examples', (req, res) => {
  const type = req.query.type || 'send'; // Get type from query param, e.g., /response-examples?type=json

  switch (type) {
    case 'send':
      // res.send(): Sends various types of responses (string, object, array, buffer).
      // Sets Content-Type automatically (e.g., text/html for string, application/json for object/array).
      res.send('<h1>Hello from res.send()!</h1><p>This is HTML.</p>');
      break;
    case 'json':
      // res.json(): Sends a JSON response. Converts non-objects (null, undefined) to JSON.
      // Sets Content-Type to application/json.
      res.json({ message: 'Hello from res.json()!', user: { id: 1, name: 'Alice' } });
      break;
    case 'status':
      // res.status(code): Sets the HTTP status code.
      // It can be chained with other response methods like send() or json().
      res.status(404).send('Resource not found (404 using res.status().send())');
      break;
    case 'sendStatus':
      // res.sendStatus(code): Sets the status code and sends the standard text representation
      // of the status code as the response body (e.g., 403 sends "Forbidden").
      // This method should not be chained with other response methods like send() or json()
      // because it already sends the response.
      res.sendStatus(403); // Sends "Forbidden"
      break;
    case 'redirect':
      // res.redirect([status,] path): Redirects to a URL derived from the specified path.
      // Default status is 302 "Found".
      res.redirect('/'); // Redirects to the homepage of this app
      break;
    case 'sendFile':
      // res.sendFile(path [, options] [, fn]): Transfers the file at the given path.
      // Sets the Content-Type response HTTP header field based on the filename’s extension.
      // The path must be absolute or specify root in options.
      // For security, __dirname should be used to make paths absolute and prevent path traversal.
      const filePath = path.join(__dirname, '05-example.html'); // Create this file
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          // It's important to handle errors, especially if the file might not exist
          // or there are permission issues.
          // If headers were already sent, Express's default error handler will close the connection.
          // Otherwise, we can send our own error response.
          if (!res.headersSent) {
            res.status(err.status || 500).send('Error sending file.');
          }
        } else {
          console.log('File sent successfully:', filePath);
        }
      });
      break;
    case 'download':
      // res.download(path [, filename] [, options] [, fn]):
      // Prompts the client to download the file.
      // Sets Content-Disposition header to "attachment".
      const downloadFilePath = path.join(__dirname, '05-example.txt'); // Create this file
      const customFilename = 'user-report.txt';
      res.download(downloadFilePath, customFilename, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
          if (!res.headersSent) {
            res.status(err.status || 500).send('Error downloading file.');
          }
        } else {
          console.log('File download prompted:', downloadFilePath);
        }
      });
      break;
    case 'setHeaders':
      // res.set(field [, value]): Sets response header(s).
      // res.header(field [, value]): Alias for res.set().
      res.set('X-Custom-Header', 'MyCustomValue');
      res.set({
        'X-Another-Header': 'AnotherValue',
        'Cache-Control': 'no-cache'
      });
      res.send('Response with custom headers set. Check your browser\'s developer tools network tab.');
      break;
    case 'cookie':
      // res.cookie(name, value [, options]): Sets a cookie.
      // To use this, you might need cookie-parser middleware for more complex scenarios,
      // but res.cookie() itself is part of Express.
      res.cookie('myCookie', 'cookieValue123', { maxAge: 900000, httpOnly: true });
      res.send('Cookie set! Check your browser\'s developer tools.');
      break;
    default:
      res.status(400).send('Invalid response type specified in query.');
  }
});

// --- Helper files for sendFile and download ---
// Create a simple HTML file for res.sendFile example
const fs = require('fs');
const exampleHtmlPath = path.join(__dirname, '05-example.html');
const exampleHtmlContent = `
<!DOCTYPE html>
<html>
<head><title>Test File</title></head>
<body><h1>This is a test HTML file served by res.sendFile().</h1></body>
</html>`;
fs.writeFileSync(exampleHtmlPath, exampleHtmlContent);

// Create a simple text file for res.download example
const exampleTxtPath = path.join(__dirname, '05-example.txt');
const exampleTxtContent = 'This is some sample text for the download example.';
fs.writeFileSync(exampleTxtPath, exampleTxtContent);


app.listen(port, () => {
  console.log(`Request/Response Objects example app listening at http://localhost:${port}`);
  console.log('\n--- Test req Object ---');
  console.log('  Visit in browser or use curl:');
  console.log(`  http://localhost:${port}/inspect-request`);
  console.log(`  http://localhost:${port}/inspect-request?name=Alice&city=Wonderland`);
  console.log('  POST to /inspect-request with JSON body:');
  console.log(`    curl -X POST -H "Content-Type: application/json" -d '{"product":"book", "qty":2}' http://localhost:${port}/inspect-request`);
  console.log('  Route with params:');
  console.log(`  http://localhost:${port}/items/electronics/456`);


  console.log('\n--- Test res Object ---');
  console.log('  Visit these URLs in your browser to see different response types:');
  console.log(`  http://localhost:${port}/response-examples?type=send`);
  console.log(`  http://localhost:${port}/response-examples?type=json`);
  console.log(`  http://localhost:${port}/response-examples?type=status`);
  console.log(`  http://localhost:${port}/response-examples?type=sendStatus`);
  console.log(`  http://localhost:${port}/response-examples?type=redirect`);
  console.log(`  http://localhost:${port}/response-examples?type=sendFile`);
  console.log(`  http://localhost:${port}/response-examples?type=download`);
  console.log(`  http://localhost:${port}/response-examples?type=setHeaders`);
  console.log(`  http://localhost:${port}/response-examples?type=cookie`);
  console.log(`  http://localhost:${port}/response-examples (defaults to 'send')`);
});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express`.
3. Save this code as `05-req-res-objects.js`.
4. It will also create `05-example.html` and `05-example.txt` in the same directory.
5. Run from terminal: `node 05-req-res-objects.js`
6. Test the routes as suggested above using your browser or curl.
*/
