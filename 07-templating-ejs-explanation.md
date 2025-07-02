# Express.js Crash Course: Templating Engines (EJS Example)

When building web applications, you often need to generate HTML dynamically based on data from your server. Templating engines provide a way to embed server-side logic and data directly into your HTML files, making it easier to create dynamic web pages.

Express.js supports various templating engines like Pug (formerly Jade), EJS (Embedded JavaScript), Handlebars, Nunjucks, and more. For this crash course, we're focusing on **EJS** because its syntax is very close to plain HTML, making it easier to pick up.

## What is EJS?

EJS stands for "Embedded JavaScript templates". It lets you write plain JavaScript within special tags in your HTML files. When a request is made to a route that renders an EJS template, Express processes the template, executes the JavaScript code, injects data, and sends the resulting HTML to the client.

## Key EJS Tags:

*   `<%= ... %>`: Outputs the value into the HTML (HTML escaped). Use this for displaying data.
    *   Example: `<h1><%= title %></h1>` will replace `<%= title %>` with the value of the `title` variable.
*   `<%- ... %>`: Outputs the unescaped value into the HTML. Use with caution, as it can lead to XSS vulnerabilities if the data is user-provided and not sanitized.
    *   Example: `<%- htmlContent %>` where `htmlContent` might be `"<p>Some HTML</p>"`.
*   `<% ... %>`: 'Scriptlet' tag, for control flow (like `if` statements, loops). No output is produced directly by this tag.
    *   Example: `<% if (user) { %> <p>Welcome, user!</p> <% } %>`
*   `<%# ... %>`: Comment tag. Its content is ignored.
    *   Example: `<%# This is an EJS comment %>`
*   `<%%` or `<%= %>`: Outputs a literal `<%` or `<%=` respectively.
*   `<% include partialName %>`: Includes another EJS template. Useful for layouts, headers, footers. (Note: Modern EJS might prefer `<%- include('partialName') %>` or similar syntax depending on configuration).

## Setting up EJS with Express (`07-templating-ejs.js`)

1.  **Install EJS:**
    First, you need to install the `ejs` package as a project dependency:
    ```bash
    npm install ejs
    ```

2.  **Configure Express to Use EJS:**
    In your main application file (e.g., `07-templating-ejs.js`):
    ```javascript
    const express = require('express');
    const path = require('path');
    const app = express();

    // Set the 'view engine' to 'ejs'
    app.set('view engine', 'ejs');

    // Set the 'views' directory (optional if your templates are in a 'views' folder in the root)
    // It's good practice to set it explicitly.
    app.set('views', path.join(__dirname, 'views'));
    ```
    *   `app.set('view engine', 'ejs');` tells Express that EJS is the templating engine to use.
    *   `app.set('views', path.join(__dirname, 'views'));` tells Express to look for template files in a directory named `views` located in the same directory as your main application script.

3.  **Create Template Files:**
    Create your `.ejs` files inside the `views` directory. For example, `views/index.ejs`.
    The `07-templating-ejs.js` example uses `views/index.ejs` (provided separately). This file contains HTML mixed with EJS tags to display dynamic data.

4.  **Render Templates in Route Handlers:**
    Use the `res.render()` method to render a template and send it as the response.
    ```javascript
    app.get('/', (req, res) => {
      const dataForTemplate = {
        title: 'My EJS Page',
        heading: 'Welcome!',
        items: ['Apple', 'Banana', 'Cherry']
      };
      // Renders 'views/index.ejs' and passes 'dataForTemplate' to it
      res.render('index', dataForTemplate);
    });
    ```
    *   The first argument to `res.render()` is the name of the template file (without the `.ejs` extension) relative to the `views` directory.
    *   The second argument is an object containing data that will be available as local variables within the template. For instance, in `index.ejs`, you can access `title`, `heading`, and `items` directly.

## Example Breakdown (`views/index.ejs`)

The provided `views/index.ejs` demonstrates:
*   Displaying simple variables: `<title><%= title %></title>`, `<h1><%= heading %></h1>`
*   Conditional rendering with `if/else`:
    ```ejs
    <% if (user) { %>
        <p>Welcome, <strong><%= user.name %></strong>!</p>
        <% if (user.isAdmin) { %>
            <p class="admin">You have admin privileges.</p>
        <% } %>
    <% } else { %>
        <p>No user data provided.</p>
    <% } %>
    ```
*   Looping through an array with `forEach`:
    ```ejs
    <% if (items && items.length > 0) { %>
        <ul>
            <% items.forEach(function(item) { %>
                <li><%= item %></li>
            <% }); %>
        </ul>
    <% } else { %>
        <p>Your shopping list is empty!</p>
    <% } %>
    ```

## Why Use Templating Engines?

*   **Separation of Concerns:** Keeps your presentation logic (HTML structure) separate from your application logic (JavaScript route handlers).
*   **Readability and Maintainability:** Makes HTML templates easier to read and write compared to constructing HTML strings in JavaScript.
*   **Reusability:** Allows you to create reusable template partials (like headers, footers, navigation bars) that can be included in multiple pages.
*   **Dynamic Content:** Easily inject data from your server into your HTML pages.

While modern front-end frameworks like React, Angular, or Vue.js often handle rendering on the client-side, server-side rendering with templating engines like EJS is still very useful for:
*   Simpler applications or specific pages.
*   Improving initial page load performance and SEO.
*   Generating emails or reports.

The `07-templating-ejs.js` example, along with the `views/index.ejs` template, provides a practical demonstration of how to integrate and use EJS with Express to serve dynamic HTML content. Remember to install `ejs` via npm and create the `views` directory with your template files.
