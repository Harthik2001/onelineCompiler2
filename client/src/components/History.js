import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AiOutlineClose } from "react-icons/ai"; // Import close icon from react-icons
import { useNavigate } from "react-router-dom"; // For navigation

const History = () => {
    const [history, setHistory] = useState([]);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate(); // Hook for navigation

    const { user, loading: authLoading } = useContext(AuthContext);

    useEffect(() => {
        console.log("History useEffect RUNNING...");
        console.log("AuthContext user object:", user);

        const fetchHistory = async () => {
            console.log(" fetchHistory FUNCTION RUNNING...");

            if (authLoading) {
                console.log(" AuthContext is still loading... Deferring history fetch.");
                return;
            }

            if (!user?.token) {
                console.error(" Token is MISSING in History.js!", { user });
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                console.log(" Fetching history from API...");
                const response = await axios.get(`${process.env.BASE_URL}/api/code/history`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                    withCredentials: true
                });

                console.log("History Data:", response.data);
                setHistory(response.data);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError(err.response?.data?.message || "Failed to fetch history");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, authLoading]);

    const handleSelect = (id) => {
        setSelectedItems((prevSelected) => {
            const newSelected = new Set(prevSelected);
            newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
            return newSelected;
        });
    };

    const handleDelete = async () => {
        if (selectedItems.size === 0) return;

        const confirmed = window.confirm("Are you sure you want to delete selected history?");
        if (!confirmed) return;

        try {
            console.log("Deleting selected history items:", Array.from(selectedItems));

            await axios.post(
                `${process.env.BASE_URL}/api/code/history/delete`,                     //change 
                { ids: Array.from(selectedItems) },
                { headers: { Authorization: `Bearer ${user.token}` }, withCredentials: true }
            );

            console.log(" Deleted successfully!");

            setHistory((prev) => prev.filter((item) => !selectedItems.has(item._id)));
            setSelectedItems(new Set());
        } catch (err) {
            console.error(" Error deleting history:", err);
            setError(err.response?.data?.message || "Error deleting history");
        }
    };

    return (
        <div className="p-4 relative">
            {/* Close Button (Top Right Corner) */}
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-2xl"
            >
                <AiOutlineClose />
            </button>

            <h2 className="text-2xl font-semibold mb-4">Submission History</h2>

            {selectedItems.size > 0 && (
                <button onClick={handleDelete} className="mb-4 px-4 py-2 bg-red-500 text-white rounded">
                    🗑 Delete Selected
                </button>
            )}

            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <p className="text-gray-500">Loading history...</p>
            ) : history.length > 0 ? (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item._id} className="border p-4 rounded-lg shadow">
                            <input
                                type="checkbox"
                                checked={selectedItems.has(item._id)}
                                onChange={() => handleSelect(item._id)}
                                className="mr-2 cursor-pointer accent-blue-500"
                            />

                            <pre className="bg-gray-100 p-2 rounded text-sm">
                                <strong>Code:</strong> <br />
                                {item.code}
                            </pre>

                            <pre className="bg-gray-200 p-2 rounded text-sm mt-2">
                                <strong>Output:</strong> <br />
                                {item.result.output}
                            </pre>

                            <p className="text-gray-500 text-xs mt-2">
                                <strong>Executed On:</strong> {new Date(item.result.timestamp).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No history found.</p>
            )}
        </div>
    );
};

export default History;
