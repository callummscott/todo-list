import express from "express";
import pg from "pg";

const app = express();
const port = process.env.PORT;
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();

async function getItems() {
  const { rows: items } = await db.query("SELECT * FROM items ORDER BY id ASC");
  return items;
}

app.get("/", async (req, res) => {
  res.render("index.ejs", {
    listTitle: "To-do",
    listItems: await getItems()
  });
});

app.post("/add", async (req, res) => {
  const { newItem: title } = req.body;
  console.log(`Adding item with title: '${title}'`);
  await db.query("INSERT INTO items (title) VALUES ($1);", [title]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const { updatedItemId: id, updatedItemTitle: title } = req.body;
  console.log(`Updating item with ID: ${id}; New title: '${title}'`);
  await db.query("UPDATE items SET title=$1 WHERE id=$2", [title, parseInt(id)]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const { deleteItemId: id } = req.body;
  console.log(`Delete item with ID: ${id}`);
  await db.query("DELETE FROM items WHERE id=$1", [parseInt(id)]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
