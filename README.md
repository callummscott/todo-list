# To-do list

> Create, edit and save a list of things to do!

<img src="docs/todo-list.png" width="64%" alt="screenshot of the to-do list interface"/>

A simple to-do list app built with Express, EJS, and PostegreSQL.

## Getting Started

If you're familiar with PostgreSQL, just follow these instructions:

1. Install modules with `npm install`
2. Run the command found in `queries.sql` to set up the table
3. Fill out a `.env` file using the provided `.env.example` one as a template
4. Start the server with `npm start`
5. Now just connect to `localhost:<PORT>` and get started!

### New to PostgreSQL?

If you're not familiar with PostgreSQL, here's some more guidance:

1. [Download and install PostgreSQL](https://www.postgresql.org/download/) for your platform if you don't have it already
2. Once successfully installed, open **pgAdmin** (included with PostgreSQL)
3. Create a new database (e.g. `todo`)
4. Right click your created database and select the Query Tool
5. Enter the following SQL to create the required table:
   ```sql
   CREATE TABLE IF NOT EXISTS items (
     id SERIAL PRIMARY KEY,
     text VARCHAR(100) NOT NULL
   );
   ```
   This command is also found in `queries.sql`. Paste it into the query tool, and execute it
6. Create a `.env` file in the project root based on `.env.example`, filling in your database credentials and desired port
7. Install dependencies with `npm install`, then start the server with `npm start`
8. Visit `localhost:<PORT>` in your browser (where `<PORT>` matches the value you set in `.env`)


## How to use

- Add new items in the input field at the bottom
- Check the checkbox to mark an item as complete
- Click the text to edit it
- Changes are saved upon `Enter`, or whenever you change focus
- Press `Esc` to cancel any changes you've made

And that's all there is to it! Have fun keeping track of your notes in your own personal database :) — `Callum`
