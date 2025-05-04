import { Link } from "react-router-dom";
import ThemeToggle from "../theme/ThemeToggle";
import PaletteSelector from "../theme/PaletteSelector";

const Navbar = () => {
  return (
    <nav className="bg-primary-700 dark:bg-primary-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Project Time Tracker
        </Link>

        <div className="flex items-center">
          <div className="flex space-x-4 mr-6">
            <Link to="/" className="hover:text-primary-200 transition-colors">
              Dashboard
            </Link>
            <Link
              to="/timer"
              className="hover:text-primary-200 transition-colors"
            >
              Timer
            </Link>
            <Link
              to="/projects"
              className="hover:text-primary-200 transition-colors"
            >
              Projects
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <PaletteSelector />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
