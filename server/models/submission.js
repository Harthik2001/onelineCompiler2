const mongoose = require("mongoose");


const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  result: { type: mongoose.Schema.Types.Mixed }, // Store as an Object instead of String
  timestamp: { type: Date, default: Date.now },
});
console.log(" Attempting to save submission:");


module.exports = mongoose.model("Submission", submissionSchema);
