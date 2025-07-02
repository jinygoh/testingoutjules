const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// --- Templating Engines ---
// Templating engines allow you to use static template files in your application.
// At runtime, the template engine replaces variables in a template file with actual values,
// and transforms the template into an HTML file sent to the client.
// This approach makes it easier to design an HTML page.

// Common templating engines used with Express: Pug (formerly Jade), EJS, Handlebars.
// We'll use EJS (Embedded JavaScript) for this example because of its simplicity
// and similarity to plain HTML.

// 1. Install the templating engine (if not already done):
// npm install ejs

// 2. Set the view engine and views directory
// 'view engine' tells Express which template engine to use.
app.set('view engine', 'ejs');
// 'views' tells Express where to find the template files.
// By default, Express looks for a directory named "views" in the application's root directory.
app.set('views', path.join(__dirname, 'views')); // Explicitly setting it, good practice

// Route to render the EJS template
app.get('/', (req, res) => {
  // Data to pass to the template
  const data = {
    title: 'EJS Templating Demo',
    heading: 'Welcome to EJS Templating!',
    message: 'This page is dynamically generated using an EJS template.',
    user: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      isAdmin: true
    },
    items: ['Apples', 'Milk', 'Bread', 'Eggs']
  };

  // res.render(viewName, localsObject)
  // - viewName: The name of the template file (without the .ejs extension) in the 'views' directory.
  // - localsObject: An object whose properties are local variables for the view.
  res.render('index', data);
  // This will look for 'views/index.ejs' and render it with the provided data.
});

app.get('/simple', (req, res) => {
  res.render('simple', {
    pageTitle: 'Simple Page',
    content: 'This is a very simple page rendered with EJS.'
  });
  // This will look for 'views/simple.ejs'
});

// Create a simple.ejs file in the 'views' directory for the /simple route:
// File: views/simple.ejs
/*
<!DOCTYPE html>
<html>
<head>
    <title><%= pageTitle %></title>
</head>
<body>
    <p><%= content %></p>
</body>
</html>
*/
// For brevity, this file (simple.ejs) is not created by this script,
// but you should create it in the 'views' folder to test the /simple route.

app.listen(port, () => {
  console.log(`Templating engine example app listening at http://localhost:${port}`);
  console.log('Ensure you have a `views` directory with `index.ejs` (and optionally `simple.ejs`).');
  console.log(`Try accessing:`);
  console.log(`  http://localhost:${port}/`);
  console.log(`  http://localhost:${port}/simple (if you created views/simple.ejs)`);
  console.log('\nTo stop the server, press Ctrl+C in the terminal.');
});

/*
How to run this file:
1. Ensure Node.js and npm are installed.
2. In your project directory, run `npm install express ejs`.
3. Create a directory named `views` in the same directory as this `07-templating-ejs.js` file.
4. Inside `views`, create `index.ejs` with the following content:

   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title><%= title %></title>
       <style>
           body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; color: #333; }
           h1 { color: #4CAF50; }
           ul { list-style-type: none; padding: 0; }
           li { background-color: #fff; margin-bottom: 5px; padding: 10px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
           .user-info { margin-bottom: 10px; }
           .user-info strong { color: #555; }
           .admin { color: red; font-weight: bold; }
       </style>
   </head>
   <body>
       <h1><%= heading %></h1>

       <p><%= message %></p>

       <% if (user) { %>
           <div class="user-info">
               <p>Welcome, <strong><%= user.name %></strong>!</p>
               <p>Your email is: <strong><%= user.email %></strong></p>
               <% if (user.isAdmin) { %>
                   <p class="admin">You have administrator privileges.</p>
               <% } %>
           </div>
       <% } else { %>
           <p>No user data provided.</p>
       <% } %>

       <h2>Shopping List:</h2>
       <% if (items && items.length > 0) { %>
           <ul>
               <% items.forEach(function(item) { %>
                   <li><%= item %></li>
               <% }); %>
           </ul>
       <% } else { %>
           <p>Your shopping list is empty!</p>
       <% } %>

       <hr>
       <p><em>This page was rendered using EJS template engine.</em></p>
   </body>
   </html>

5. Optionally, create `views/simple.ejs` for the `/simple` route.
6. Run the server: `node 07-templating-ejs.js`
7. Open your browser and navigate to `http://localhost:3000/`. You should see the rendered HTML page.
*/
