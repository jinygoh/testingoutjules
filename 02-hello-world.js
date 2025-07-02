// 1. Import Express
const express = require('express');

// 2. Create an Express application instance
const app = express();

// 3. Define the port the application will run on
// Use the PORT environment variable if available, otherwise default to 3000
const port = process.env.PORT || 3000;

// 4. Define a route handler for GET requests to the root URL ("/")
// req: The request object (contains information about the incoming HTTP request)
// res: The response object (used to send a response back to the client)
app.get('/', (req, res) => {
  // Send the string "Hello World!" as the response
  res.send('Hello World!');
});

// 5. Start the server and make it listen for incoming requests on the specified port
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});

/*
How to run this file:
1. Make sure you have Node.js installed.
2. Make sure you have initialized a project (`npm init -y`) and installed express (`npm install express`) in the same directory as this file OR in a parent directory with a node_modules folder.
   If you are running this as part of the crash course files, you likely already did this.
3. Open your terminal in the directory where this file is saved.
4. Run the command: `node 02-hello-world.js`
5. Open your web browser and navigate to `http://localhost:3000`. You should see "Hello World!".
6. To stop the server, go back to your terminal and press `Ctrl + C`.
*/
