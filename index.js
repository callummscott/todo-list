import express from "express";
import pg from "pg";

// Check for required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}


// Initialize Express app and PostgreSQL client
const app = express();
const port = process.env.PORT;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
})

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();


/**
 * Retrieves all to-do list items from the database.
 * @returns {Promise<Array>} Array of to-do items.
 */
async function getItems() {
  const { rows: items } = await db.query("SELECT * FROM items ORDER BY id ASC");
  return items;
}

/**
 * GET / - Renders the main page with all to-do list items.
 */
app.get("/", async (req, res) => {
  res.render("index.ejs", {
    listTitle: "To-do",
    listItems: await getItems()
  });
});

/**
 * POST /add - Adds a new to-do item to the list.
 */
app.post("/add", async (req, res) => {
  try {
    const { newItem: text } = req.body;
    if (!text || text.trim() === "") {
      return res.redirect("/");
    }
    await db.query("INSERT INTO items (text) VALUES ($1);", [text]);
    res.redirect("/");
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * POST /edit - Changes the content of an existing to-do item.
 */
app.post("/edit", async (req, res) => {
  const { updatedItemId: id, updatedItemText: text } = req.body;
  console.log(`Updating item with ID: ${id}; New text: '${text}'`);
  await db.query("UPDATE items SET text=$1 WHERE id=$2", [text, parseInt(id)]);
  res.redirect("/");
});

/**
 * POST /delete - Deletes an existing to-do item by its ID.
 */
app.post("/delete", async (req, res) => {
  const { deleteItemId: id } = req.body;
  console.log(`Delete item with ID: ${id}`);
  await db.query("DELETE FROM items WHERE id=$1", [parseInt(id)]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
