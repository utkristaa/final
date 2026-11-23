const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const recipeRoutes = require("./routes/recipeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipeRoutes);

async function startServer() {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
  server.on("error", (error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
