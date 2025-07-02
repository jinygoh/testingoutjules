const express = require('express');
const path = require('path'); // Core Node.js module for working with file paths
const app = express();
const port = 3000;

// --- Serving Static Files with express.static ---

// The express.static middleware function is used to serve static files
// such as images, CSS files, and JavaScript files.

// Syntax: express.static(root, [options])
// - root: The root directory from which to serve static assets.
// - options: An object for various settings (e.g., maxAge, index).

// Create a 'public' directory in your project root.
// Inside 'public', you can create subdirectories like 'css', 'js', 'images'.
// For this example, we'll assume you have:
// public/
//   ├── index.html
//   ├── css/
//   │   └── style.css
//   ├── js/
//   │   └── main.js
//   └── images/
//       └── express-logo.png (You'll need to add an image here)

// This line tells Express to serve static files from the 'public' directory.
// __dirname is a Node.js global variable that gives the directory name of the current module.
// path.join() is used to create a platform-independent path.
app.use(express.static(path.join(__dirname, 'public')));

// How it works:
// When a request comes in, Express will look for a matching file in the 'public' directory.
// - If you request `http://localhost:3000/css/style.css`, Express serves `public/css/style.css`.
// - If you request `http://localhost:3000/js/main.js`, Express serves `public/js/main.js`.
// - If you request `http://localhost:3000/images/express-logo.png`, Express serves `public/images/express-logo.png`.
// - If you request `http://localhost:3000/`, Express will look for an `index.html` file in the 'public' directory by default.

// You can also mount the static directory on a specific path (virtual path prefix):
// app.use('/static', express.static(path.join(__dirname, 'public')));
// With this setup, you would access files like:
// `http://localhost:3000/static/css/style.css`
// `http://localhost:3000/static/index.html`

// --- Example Route (Optional - Not needed if index.html is served) ---
// If you don't have an index.html in your static directory, or want a specific
// route for the homepage, you can still define it.
// However, if `public/index.html` exists, `express.static` will serve it for `/` requests
// before this route handler is reached (if `app.use(express.static(...))` is defined before this).

/*
// This route would be overshadowed by public/index.html if it exists
app.get('/', (req, res) => {
  res.send('This is the dynamic homepage. If you see this, public/index.html was not found or static middleware is after this route.');
});
*/

app.listen(port, () => {
  console.log(`Static files server listening at http://localhost:${port}`);
  console.log('Ensure you have a `public` directory with `index.html`, `css/style.css`, `js/main.js`, and `images/express-logo.png`');
  console.log(`Try accessing:`);
  console.log(`  http://localhost:${port}/`);
  console.log(`  http://localhost:${port}/index.html`);
  console.log(`  http://localhost:${port}/css/style.css`);
  console.log(`  http://localhost:${port}/js/main.js`);
  console.log(`  http://localhost:${port}/images/express-logo.png`);
  console.log(`  http://localhost:${port}/nonexistentfile.txt (should give a 404)`);
});

/*
To set up this example:
1. Create a directory named `public` in the same directory as this `06-static-files.js` file.
2. Inside `public`, create:
   - `index.html` (a simple HTML file)
   - `css/style.css` (a simple CSS file)
   - `js/main.js` (a simple JS file)
   - `images/express-logo.png` (place an image file here)

Example `public/index.html`:
<!DOCTYPE html>
<html>
<head>
    <title>Static Page</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <h1>Hello from Static HTML!</h1>
    <img src="/images/express-logo.png" alt="Logo">
    <script src="/js/main.js"></script>
</body>
</html>

Example `public/css/style.css`:
body { background-color: lightblue; font-family: sans-serif; }
h1 { color: navy; }

Example `public/js/main.js`:
console.log("Static JavaScript file loaded!");
alert("Hello from static JavaScript!");

3. Run `npm install express` if you haven't already.
4. Run the server: `node 06-static-files.js`
5. Open your browser and navigate to `http://localhost:3000/`. You should see your `index.html` page.
   Also try accessing `/css/style.css`, `/js/main.js`, and `/images/express-logo.png` directly.
*/
