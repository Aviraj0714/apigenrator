import React, { useState } from "react";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { motion } from "framer-motion";

const ApiGenerator = () => {
  type Route = { path: string; method: string; response: string };
  const [routes, setRoutes] = useState<Route[]>([
    { path: "", method: "get", response: "{}" },
  ]);
  const [language, setLanguage] = useState("express");
  const [middleware, setMiddleware] = useState({
    cors: true,
    auth: false,
    rateLimit: false,
  });
  const [database, setDatabase] = useState("none");
  const [databaseName, setDatabaseName] = useState("");
  const [mongoURI, setMongoURI] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // Add a new route
  const addRoute = () => {
    setRoutes([...routes, { path: "", method: "get", response: "{}" }]);
  };

  // Update a route field
  const updateRoute = (index: number, key: keyof Route, value: string) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index] = { ...updatedRoutes[index], [key]: value };
    setRoutes(updatedRoutes);
  };

  // Toggle middleware options
  const toggleMiddleware = (key: string) => {
    setMiddleware({ ...middleware, [key]: !middleware[key] });
  };

  // Generate API Code
  const generateAPI = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate-api", {
        routes,
        language,
        middleware,
        database,
        databaseName,
        mongoURI,
      });
      setGeneratedCode(response.data.code);
    } catch (error) {
      console.error("Error generating API:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 gap-4">
      {/* Left Section: Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 p-4 bg-gray-900 text-white rounded-xl shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4">API Generator</h1>

        {/* Backend Language Selection */}
        <label className="block text-sm mb-1">Backend Language:</label>
        <select
          className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="express">Express.js</option>
        </select>

        {/* Middleware Selection */}
        <h2 className="text-xl font-semibold mt-4">Middleware</h2>
        {Object.keys(middleware).map((key) => (
          <label key={key} className="block mt-2">
            <input
              type="checkbox"
              checked={middleware[key]}
              onChange={() => toggleMiddleware(key)}
            />{" "}
            {key.toUpperCase()}
          </label>
        ))}

        {/* Database Selection */}
        <h2 className="text-xl font-semibold mt-4">Database</h2>
        <select
          className="w-full p-2 bg-gray-700 text-white rounded-lg"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
        >
          <option value="none">None</option>
          <option value="mongodb">MongoDB</option>
          <option value="postgresql">PostgreSQL</option>
        </select>

        {/* Database Name Field (Only when DB is selected) */}
        {database !== "none" && (
          <div className="mt-3">
            <label className="block text-sm mb-1">Database Name:</label>
            <input
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              type="text"
              placeholder="Enter database name"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
            />
          </div>
        )}

        {/* MongoDB URI Field (Only when MongoDB is selected) */}
        {database === "mongodb" && (
          <div className="mt-3">
            <label className="block text-sm mb-1">MongoDB URI:</label>
            <input
              className="w-full p-2 bg-gray-700 text-white rounded-lg"
              type="text"
              placeholder="mongodb://localhost:27017/mydb"
              value={mongoURI}
              onChange={(e) => setMongoURI(e.target.value)}
            />
          </div>
        )}

        {/* Routes Section */}
        <h2 className="text-xl font-semibold mt-4">Routes</h2>
        {routes.map((route, index) => (
          <div key={index} className="flex gap-2 mt-2">
            <input
              className="p-2 flex-1 bg-gray-700 text-white rounded-lg"
              type="text"
              placeholder="Path"
              value={route.path}
              onChange={(e) => updateRoute(index, "path", e.target.value)}
            />
            <select
              className="p-2 bg-gray-700 text-white rounded-lg"
              value={route.method}
              onChange={(e) => updateRoute(index, "method", e.target.value)}
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>
          </div>
        ))}

        <button
          className="mt-4 p-2 w-full bg-blue-500 rounded-lg text-white"
          onClick={addRoute}
        >
          Add Route
        </button>
        <button
          className="mt-2 p-2 w-full bg-green-500 rounded-lg text-white"
          onClick={generateAPI}
        >
          Generate API
        </button>
      </motion.div>

      {/* Right Section: Code Output */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 p-4 bg-gray-900 text-white rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-4">Generated Code</h2>
        <CodeMirror
          value={generatedCode}
          extensions={[javascript()]}
          theme={vscodeDark}
          className="rounded-lg overflow-hidden border border-gray-700"
        />
      </motion.div>
    </div>
  );
};

export default ApiGenerator;
