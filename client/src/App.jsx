import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/about";
import Contact from "./pages/Contact";
import LandingPage from "./pages/LandingPage";
import LoginNGO from "./pages/auth/LoginNGO";
import LoginRestaurant from "./pages/auth/LoginRestaurant";
import RegisterNGO from "./pages/auth/RegisterNGO";
import RegisterRestaurant from "./pages/auth/RegisterRestaurant";
import AddLocation from "./pages/auth/AddLocation";
import NGODashboard from "./pages/dashboards/NGODashboard";
import RestaurantDashboard from "./pages/dashboards/RestaurantDashboard";
import RestaurantReviewsPage from "./pages/RestaurantReviewsPage";

const App = () => {
  return (
    <>
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">FoodConnect</h1>
        <div className="space-x-6">
          <Link className="hover:text-blue-600" to="/">Home</Link>
          <Link className="hover:text-blue-600" to="/about">About</Link>
          <Link className="hover:text-blue-600" to="/contact">Contact</Link>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/ngo-dashboard" element={<NGODashboard />} />
        <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />

        {/* Auth Routes */}
        <Route path="/login-ngo" element={<LoginNGO />} />
        <Route path="/login-restaurant" element={<LoginRestaurant />} />
        <Route path="/register-ngo" element={<RegisterNGO />} />
        <Route path="/register-restaurant" element={<RegisterRestaurant />} />
        <Route path="/add-location/:role" element={<AddLocation />} />
        
        {/* Reviews Page */}
        <Route path="/restaurant-reviews/:restaurantId" element={<RestaurantReviewsPage />} />
      </Routes>
    </>
  );
};

export default App;
