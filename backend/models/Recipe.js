// Recipe.js - the schema describes what ONE recipe looks like in MongoDB
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  ingredients: { type: String, required: true }, // one big text box keeps it simple
  instructions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // filled in automatically
});

// "Recipe" -> MongoDB makes a collection called "recipes"
module.exports = mongoose.model("Recipe", recipeSchema);
