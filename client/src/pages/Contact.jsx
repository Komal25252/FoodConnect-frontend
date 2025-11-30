import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  // Regex for validation
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@gmail\.com$/;

  const validate = () => {
    const newErrors = {};
    if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Name should contain only alphabets and spaces.";
    }
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid Gmail address (e.g., user@gmail.com).";
    }
    if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/contact", formData);
      setStatus("✅ Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("❌ Failed to send message. Try again later.");
      console.error(error);
    }
  };

  return (
    <div className="px-6 py-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-4">Contact Us</h2>
        <p className="text-gray-600 text-center mb-6">
          Have questions or want to collaborate? Reach out to us!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Gmail Address"
              required
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows="4"
              required
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.message ? "border-red-500 ring-red-300" : "border-gray-300 focus:ring-blue-500"
              }`}
            ></textarea>
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Send Message
          </button>
        </form>

        {status && (
          <p
            className={`mt-4 text-center ${
              status.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Contact;


// import React, { useState } from "react";
// import axios from "axios";

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [status, setStatus] = useState("");

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/api/contact", formData);
//       setStatus("✅ Message sent successfully!");
//       setFormData({ name: "", email: "", message: "" });
//     } catch (error) {
//       setStatus("❌ Failed to send message. Try again later.");
//       console.error(error);
//     }
//   };

//   return (
//     <div className="px-6 py-12 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
//       <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
//         <h2 className="text-3xl font-bold text-center mb-4">Contact Us</h2>
//         <p className="text-gray-600 text-center mb-6">
//           Have questions or want to collaborate? Reach out to us!
//         </p>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Your Name"
//             required
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Your Email"
//             required
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <textarea
//             name="message"
//             value={formData.message}
//             onChange={handleChange}
//             placeholder="Your Message"
//             rows="4"
//             required
//             className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           ></textarea>
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
//           >
//             Send Message
//           </button>
//         </form>

//         {status && (
//           <p
//             className={`mt-4 text-center ${
//               status.includes("✅") ? "text-green-600" : "text-red-500"
//             }`}
//           >
//             {status}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Contact;


// import React from "react";

// const Contact = () => {
//   return (
//     <div className="p-10 text-center">
//       <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
//       <p className="text-gray-600 mb-6">
//         Have questions or want to collaborate? Reach out to us!
//       </p>
//       <form className="max-w-md mx-auto space-y-4">
//         <input
//           type="text"
//           placeholder="Your Name"
//           className="w-full border px-4 py-2 rounded-lg"
//         />
//         <input
//           type="email"
//           placeholder="Your Email"
//           className="w-full border px-4 py-2 rounded-lg"
//         />
//         <textarea
//           placeholder="Your Message"
//           className="w-full border px-4 py-2 rounded-lg"
//           rows="4"
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Send Message
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Contact;
