import express from "express";
import pg from "pg";


function checkEnvVariables() {
  const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length === 0) { return; }
  
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  process.exit(1);
}

function logRequests(req, res, next) {
  console.log(`${req.method}  "${req.url}"`);
  if (req.method === 'POST') console.log(`  Body: ${JSON.stringify(req.body)}`);
  next();
}


// Initialize Express app and PostgreSQL client
const app = express();
const PORT = process.env.PORT || 3000;

checkEnvVariables();
const db = new pg.Pool({
  user:      process.env.DB_USER,
  host:      process.env.DB_HOST,
  database:  process.env.DB_NAME,
  password:  process.env.DB_PASSWORD,
  port:      process.env.DB_PORT
})

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
if (process.env.LOGGING == 'true') { app.use(logRequests); }
    
db.connect().catch(err => {
  console.error("Failed to connect to the database:", err);
  process.exit(1);
});


/**
 * GET / - Renders the main page with all to-do list items.
 */
app.get("/", async (req, res) => {
  const { rows: items } = await db.query("SELECT * FROM items ORDER BY id ASC;");
  res.render("index.ejs", { listItems: items })
});

/**
 * POST /add - Adds a new to-do item to the list.
 */
app.post("/add", async (req, res) => {
  const { newItem: text } = req.body;

  // Skip trying to submit empty strings.
  if (!text || text.trim() === "") {
    console.error("ERROR: User tried submitting an empty string.");
    res.redirect("/");
    return;
  }

  await db.query("INSERT INTO items (text) VALUES ($1);", [text]);
  res.redirect("/");
});

/**
 * POST /edit - Changes the content of an existing to-do item.
 */
app.post("/edit", async (req, res) => {
  const { editedId: id, editedText: text } = req.body;
  if (!text || text.trim() === "") {
    console.error("ERROR: User-edited text was empty.");
    res.redirect("/");
    return;
  };
  if (text.length > 100) {
    console.error("ERROR: User-submitted text was too long.");
    res.redirect("/");
    return;
  };
  // Ideally send feedback to the user if the above conditions aren't met.
  await db.query("UPDATE items SET text=$1 WHERE id=$2;", [text, id]);
  res.redirect("/");
});

/**
 * POST /delete - Deletes an existing to-do item by its ID.
 */
app.post("/delete", async (req, res) => {
  const { deletedId: id } = req.body;
  await db.query("DELETE FROM items WHERE id=$1;", [id]);
  res.redirect("/");
});

/**
 * Global catchall error handling.
 */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
