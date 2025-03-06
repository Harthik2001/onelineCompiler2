import React, { useState, useContext } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { go } from "@codemirror/lang-go";
import { createTheme } from "@uiw/codemirror-themes";
import { ThemeContext } from "../context/ThemeContext";
import { executeCode } from "../api";
import { AuthContext } from "../context/AuthContext";
import Layout from "./Layout";
import { AiOutlineReload, AiOutlineDownload } from "react-icons/ai";
import { BsSun, BsMoon } from "react-icons/bs";

// Custom GitHub Themes
const githubDark = createTheme({
  theme: "dark",
  settings: {
    background: "#0d1117",
    foreground: "#c9d1d9",
    caret: "#ffffff",
    selection: "#3b82f680",
    selectionMatch: "#3b82f680",
    lineHighlight: "#2a2b3c",
  },
});

const githubLight = createTheme({
  theme: "light",
  settings: {
    background: "#ffffff",
    foreground: "#24292e",
    caret: "#24292e",
    selection: "#dbe9f5",
    selectionMatch: "#dbe9f5",
    lineHighlight: "#f6f8fa",
  },
});

const Editor = () => {
  const [languageId, setLanguageId] = useState(71); // Default to Python
  const [sourceCode, setSourceCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  // Function to determine the language mode
  const getLanguage = (langId) => {
    switch (langId) {
      case 71: return python();
      case 50: return cpp();
      case 54: return cpp();
      case 62: return java();
      case 60: return go();
      default: return javascript();
    }
  };

  // Handle Code Execution
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");

    if (!languageId) {
      alert("Please select a language before running the code!");
      return;
    }

    try {
      const response = await executeCode(languageId, sourceCode, userInput, user.token);
      const timestamp = new Date().toLocaleString(); // Get timestamp

      if (response.error) {
        setResult(`Timestamp: ${timestamp}\nError: ${response.error}`);
      } else {
        setResult(
          `Timestamp: ${timestamp}\n\nOutput:\n${response.output}\n\nMemory Used: ${response.memoryUsed}\nExecution Time: ${response.executionTime}`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Execution failed");
    }
  };

  // Handle Code Download
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([sourceCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "code.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Layout>
      <div className={`flex flex-col h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b bg-gray-100 dark:bg-gray-800">
          
          {/* Left Side: Refresh & Download */}
          <div className="flex items-center space-x-3">
            <button onClick={() => { setSourceCode(''); setUserInput(''); setResult(''); setError(''); }} className="text-xl">
              <AiOutlineReload />
            </button>
            <button onClick={handleDownload} className="text-xl">
              <AiOutlineDownload />
            </button>
          </div>

          {/* Middle: Font Size & Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* Font Size Adjuster */}
            <div className="flex items-center space-x-2">
              <button onClick={() => setFontSize((prev) => Math.max(prev - 2, 10))} className="px-2 py-1 border rounded-md">
                A-
              </button>
              <span className="font-bold">{fontSize}px</span>
              <button onClick={() => setFontSize((prev) => Math.min(prev + 2, 24))} className="px-2 py-1 border rounded-md">
                A+
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center px-2 py-1 border rounded-md"
            >
              {theme === "dark" ? <BsSun className="text-yellow-400" /> : <BsMoon className="text-gray-700" />}
              <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>

          {/* Right Side: Run Button */}
          <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm">
            Run
          </button>
        </div>

        {/* Editor Section */}
        <div className="flex flex-grow">
          {/* Code Editor */}
          <div className="w-1/2 p-3 border-r relative">
            <label className="block font-semibold">Language:</label>
            <select
              value={languageId}
              onChange={(e) => setLanguageId(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md bg-white text-black dark:bg-gray-900 dark:text-white"
            >
              <option value="" disabled hidden>
                Select Language
              </option>
              <option value={71}>Python</option>
              <option value={50}>C</option>
              <option value={54}>C++</option>
              <option value={62}>Java</option>
              <option value={60}>Go</option>
            </select>


            <label className="block font-semibold mt-3">Code:</label>
            <CodeMirror
              value={sourceCode}
              height="600px"
              theme={theme === "dark" ? githubDark : githubLight} // Apply theme dynamically
              extensions={[getLanguage(languageId)]} // Apply language syntax
              onChange={(value) => setSourceCode(value)}
              style={{ fontSize: `${fontSize}px` }}
            />
          </div>

          {/* User Input & Output Section */}
          <div className="w-1/2 p-3 flex flex-col">
            <label className="block font-semibold">User Input:</label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full h-20 p-2 border rounded-md font-mono bg-white text-black dark:bg-gray-900 dark:text-white"
              placeholder="Enter input here...(if there is multi line input, separate by newline)"
            />


            <div className="flex-1 mt-3 overflow-auto border p-3 rounded-lg bg-gray-100 dark:bg-gray-800 h-96">
              <h3 className="font-semibold">Output/Errors:</h3>
              {error && <p className="text-red-500">{error}</p>}
              {result && <pre className="p-2 rounded font-mono">{result}</pre>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Editor;
