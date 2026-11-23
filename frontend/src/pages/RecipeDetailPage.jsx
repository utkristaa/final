import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function RecipeDetailPage() {
  const { id } = useParams();   // reads :id from the URL /recipe/:id
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null); // null = not loaded yet

  useEffect(() => {
    fetch("/api/recipes/" + id)
      .then((res) => res.json())
      .then((data) => setRecipe(data))
      .catch((err) => console.log(err));
  }, [id]); // re-run if the id in the URL changes

  async function handleDelete() {
    if (!window.confirm("Delete this recipe?")) return;
    await fetch("/api/recipes/" + id, { method: "DELETE" });
    navigate("/"); // go back to the list afterwards
  }

  return (
    <div>
      {recipe === null ? (
        <p>Loading...</p>
      ) : (
        <div className="detail">
          <h2>{recipe.title}</h2>
          <p className="meta">
            By {recipe.author} • {new Date(recipe.createdAt).toLocaleDateString()}
          </p>
          <h3>Ingredients</h3>
          <p className="text">{recipe.ingredients}</p>
          <h3>Instructions</h3>
          <p className="text">{recipe.instructions}</p>
          <div className="buttons">
            <Link className="btn" to={"/edit/" + recipe._id}>Edit</Link>
            <button className="danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetailPage;
