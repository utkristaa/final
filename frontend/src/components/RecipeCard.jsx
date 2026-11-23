import { useNavigate } from "react-router-dom";

// Props are destructured: the parent passes one recipe object
function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/recipe/" + recipe._id); // go to the detail page
  }

  return (
    <div className="card" onClick={handleClick}>
      <h3>{recipe.title}</h3>
      <p className="meta">By {recipe.author}</p>
      {/* slice(0, 80) shows only a short preview of the instructions */}
      <p>{recipe.instructions.slice(0, 80)}...</p>
    </div>
  );
}

export default RecipeCard;
