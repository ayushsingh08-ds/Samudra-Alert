import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("citizen");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name) {
      alert("Please enter your name");
      return;
    }

    // save to context/localStorage if needed
    localStorage.setItem("user", JSON.stringify({ name, role }));

    // redirect based on role
    if (role === "citizen") navigate("/citizen");
    if (role === "analyst") navigate("/analyst");
    if (role === "admin") navigate("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-blue-700 mb-6">
          🌊 Samudra Alert Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Role select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="citizen">Citizen</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
