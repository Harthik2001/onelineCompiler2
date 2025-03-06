const Submission = require("../models/submission");
const codeExecutionService = require("../services/codeExecutionService");

exports.executeCode = async (req, res) => {
  try {
    const { language, code, userInput } = req.body;
    const userId = req.user?._id; // Ensure userId is extracted safely

    console.log(" Received in Controller - userId:", userId);
    console.log(" Received in Controller - language:", language);
    console.log(" Received in Controller - code:", code);
    console.log(" Received in Controller - userInput:", userInput);

    if (!language || !code) {
      return res.status(400).json({ message: "Language and code are required." });
    }

    // Pass userInput to the execution service
    const result = await codeExecutionService.execute(userId, language, code, userInput);

    if (!result) {
      console.error(" Error: Code execution returned no result.");
      return res.status(500).json({ message: "Execution failed. No response from executor." });
    }

    console.log("Execution Result:", result);

    // Save structured JSON instead of a string
    const submission = new Submission({
      userId,
      language,
      code,
      userInput,
      result, // Directly store as an object
    });

    console.log(" Saving Submission to DB:", submission);
    await submission.save();
    console.log(" Successfully saved submission!");

    res.json(result); // Return clean JSON output
  } catch (error) {
    console.error(" Execution Error in executeCode:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  console.log(' Fetching History');
  try {
    const userId = req.user?._id;
    console.log(" Extracted user ID:", req.user?._id);
    console.log(" Fetching History for User:", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing." });
    }

    const history = await Submission.find({ userId }).sort({ createdAt: -1 });
    console.log(" Raw History Data:", await Submission.find({ userId }));

    if (!history.length) {
      console.log("ℹ No past submissions found.");
    }

    res.json(history);
  } catch (error) {
    console.error(" Error fetching history:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.deleteHistory = async (req, res) => {
  try {
    const { ids } = req.body; // Receive array of IDs to delete

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid request format." });
    }

    console.log("Deleting History Items:", ids);

    await Submission.deleteMany({ _id: { $in: ids } });

    res.json({ message: "Selected history deleted successfully." });
  } catch (error) {
    console.error("Error deleting history:", error);
    res.status(500).json({ message: error.message });
  }
};
