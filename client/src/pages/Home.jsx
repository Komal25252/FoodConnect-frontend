import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 py-8">
      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-600 mb-3 sm:mb-4 text-center">
        Welcome to FoodConnect
      </h1>
      <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 text-center max-w-xl px-4">
        Bridging the gap between restaurants and NGOs to reduce food waste and
        help communities in need.
      </p>

      {/* Auth Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl px-4">
        {/* NGO Section */}
        <div className="flex flex-col space-y-3 sm:space-y-4 bg-white shadow-md rounded-2xl p-5 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-bold text-gray-700 text-center">
            NGO Access
          </h2>
          <Link
            to="/login-ngo"
            className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-center hover:bg-blue-700 transition text-sm sm:text-base"
          >
            NGO Login
          </Link>
          <Link
            to="/register-ngo"
            className="bg-green-600 text-white py-2.5 px-4 rounded-lg text-center hover:bg-green-700 transition text-sm sm:text-base"
          >
            NGO Register
          </Link>
        </div>

        {/* Restaurant Section */}
        <div className="flex flex-col space-y-3 sm:space-y-4 bg-white shadow-md rounded-2xl p-5 sm:p-6 w-full">
          <h2 className="text-base sm:text-lg font-bold text-gray-700 text-center">
            Restaurant Access
          </h2>
          <Link
            to="/login-restaurant"
            className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-center hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Restaurant Login
          </Link>
          <Link
            to="/register-restaurant"
            className="bg-green-600 text-white py-2.5 px-4 rounded-lg text-center hover:bg-green-700 transition text-sm sm:text-base"
          >
            Restaurant Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;