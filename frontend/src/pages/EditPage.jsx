import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  // Load the existing recipe so the form can start with its values
  useEffect(() => {
    fetch("/api/recipes/" + id)
      .then((res) => res.json())
      .then((data) => setRecipe(data))
      .catch((err) => console.log(err));
  }, [id]);

  async function handleUpdate(recipeData) {
    await fetch("/api/recipes/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipeData),
    });
    navigate("/recipe/" + id); // back to the detail page
  }

  return (
    <div>
      <h2>Edit Recipe</h2>
      {/* The form only appears AFTER the data loaded, so its starting values are correct */}
      {recipe === null ? (
        <p>Loading...</p>
      ) : (
        <RecipeForm
          initialTitle={recipe.title}
          initialAuthor={recipe.author}
          initialIngredients={recipe.ingredients}
          initialInstructions={recipe.instructions}
          buttonText="Update Recipe"
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

export default EditPage;
