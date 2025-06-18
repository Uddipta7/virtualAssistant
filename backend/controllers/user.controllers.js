import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";

// Get the currently logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Failed to fetch current user" });
  }
};

// Update assistant name or image
export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body;

        if (!assistantName || !imageUrl) {
            return res.status(400).json({ 
                message: "Both assistantName and imageUrl are required" 
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { 
                assistantName, 
                assistantImage: imageUrl 
            },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found for update" });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error("updateAssistant error:", error);
        return res.status(500).json({ 
            message: "Failed to update assistant settings",
            error: error.message 
        });
    }
};

// Ask a command to assistant
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== "string" || command.trim().length === 0) {
      return res.status(400).json({
        type: "error",
        response: "Please provide a valid command",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        type: "error",
        response: "User not found",
      });
    }

    user.history = [...(user.history || []).slice(-19), command];
    await user.save();

    // Get assistant response
    const result = await geminiResponse(command, user.assistantName, user.name);

    switch (result?.type) {
      case "get-time":
        result.response = `Current time is ${moment().format("hh:mm A")}`;
        break;
      case "get-date":
        result.response = `Today's date is ${moment().format("YYYY-MM-DD")}`;
        break;
      case "get-day":
        result.response = `Today is ${moment().format("dddd")}`;
        break;
      case "get-month":
        result.response = `This month is ${moment().format("MMMM")}`;
        break;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("askToAssistant error:", error.message);
    return res.status(500).json({
      type: "error",
      response: "Sorry, I'm having trouble processing your request.",
    });
  }
};