import { useState } from "react";

// Used by BOTH the create page and the edit page.
// Props: initial values (empty for create, filled for edit), the button text,
// and onSave - a function from the parent that runs when the form is submitted.
function RecipeForm({ initialTitle, initialAuthor, initialIngredients, initialInstructions, buttonText, onSave }) {
  // One useState per field (controlled inputs)
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [instructions, setInstructions] = useState(initialInstructions);

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    onSave({ title, author, ingredients, instructions }); // hand the data to the parent
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Author</label>
      <input value={author} onChange={(e) => setAuthor(e.target.value)} required />

      <label>Ingredients (one per line)</label>
      <textarea rows="5" value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />

      <label>Instructions</label>
      <textarea rows="7" value={instructions} onChange={(e) => setInstructions(e.target.value)} required />

      <button type="submit">{buttonText}</button>
    </form>
  );
}

export default RecipeForm;
