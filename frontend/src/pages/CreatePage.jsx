import { useNavigate } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";

function CreatePage() {
  const navigate = useNavigate();

  // Runs when RecipeForm calls onSave(...) with the form data
  async function handleCreate(recipeData) {
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // tells Express we send JSON
      body: JSON.stringify(recipeData),                // objects must become text
    });
    navigate("/"); // cleanup: go back to the list
  }

  return (
    <div>
      <h2>Add a Recipe</h2>
      <RecipeForm
        initialTitle=""
        initialAuthor=""
        initialIngredients=""
        initialInstructions=""
        buttonText="Save Recipe"
        onSave={handleCreate}
      />
    </div>
  );
}

export default CreatePage;
