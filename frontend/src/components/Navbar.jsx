import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h1 className="logo">🍳 Recipe Book</h1>
      <div className="nav-links">
        {/* NavLink changes the URL without reloading the page */}
        <NavLink to="/">All Recipes</NavLink>
        <NavLink to="/create">Add Recipe</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
