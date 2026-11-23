import { useState, useEffect } from "react";
import RecipeCard from "../components/RecipeCard";

function HomePage() {
  const [recipes, setRecipes] = useState([]);       // the list from the backend
  const [loading, setLoading] = useState(true);     // true until data arrives

  // useEffect with [] runs ONCE after the first render (to load data)
  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);     // saving into state makes React re-render
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>All Recipes</h2>
      {/* Ternary: loading message, empty message, or the list */}
      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes yet. Add the first one!</p>
      ) : (
        <div className="grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
