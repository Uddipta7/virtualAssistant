import axios from "axios";

const geminiResponse = async (
  command,
  assistantName = "Your Assistant",
  userName = "User"
) => {
  const evaluateMath = (text) => {
    const mathPattern = /^[\d+\-*/().\s]+$/;
    const cleanText = text.replace(/ /g, "");

    if (mathPattern.test(cleanText)) {
      try {
        const result = Function(`"use strict"; return (${cleanText})`)();
        return isFinite(result) ? `The answer is ${result}` : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const promptSuggestions = [
    "What can you do?", "Open calculator", "Show today's news", "Tell me a joke", "What time is it?",
    "Search for AI trends", "Open YouTube", "Show weather forecast", "Open Google Maps", "What's on my calendar?",
    "Set a reminder", "Play some music", "Find nearby restaurants", "Define artificial intelligence", "How to make pizza?"
  ];

  const getLocalResponse = (cmd) => {
    const lowerCmd = cmd.toLowerCase().trim();
    const mathResponse = evaluateMath(cmd);
    if (mathResponse) {
      return {
        type: "math",
        userInput: cmd,
        response: mathResponse,
        url: null,
        suggestions: promptSuggestions
      };
    }

    if (["hello", "hi", "hey"].includes(lowerCmd)) {
      return {
        type: "greeting",
        userInput: cmd,
        response: `Hello ${userName}! I'm ${assistantName}. Try asking me things like:`,
        suggestions: promptSuggestions.slice(0, 5),
        url: null
      };
    }

    if (["what can you do", "help", "features"].includes(lowerCmd)) {
      return {
        type: "help",
        userInput: cmd,
        response: "I can help with:",
        suggestions: promptSuggestions,
        url: null
      };
    }

    if (lowerCmd === "how are you") {
      return {
        type: "status",
        userInput: cmd,
        response: "I'm functioning optimally. How can I assist you today?",
        suggestions: promptSuggestions.slice(2, 7),
        url: null
      };
    }

    if (["who are you", "what do you do"].includes(lowerCmd)) {
      return {
        type: "identity",
        userInput: cmd,
        response: `I'm ${assistantName}, your AI assistant. I can perform various tasks like calculations, web searches, and more.`,
        suggestions: promptSuggestions.slice(3, 8),
        url: null
      };
    }

    if (lowerCmd.includes("joke")) {
      return {
        type: "joke",
        userInput: cmd,
        response: "Why don't scientists trust atoms? Because they make up everything!",
        suggestions: promptSuggestions.filter(s => s.includes('tell') || s.includes('joke')),
        url: null
      };
    }

    if (lowerCmd.startsWith("remind me to") || lowerCmd.startsWith("set a reminder")) {
      const reminderText = lowerCmd.replace(/(remind me to|set a reminder)/, "").trim();
      return {
        type: "reminder",
        userInput: cmd,
        response: `I'll remind you to: ${reminderText}`,
        suggestions: [],
        url: null
      };
    }

    // Dynamic music play
    if (lowerCmd.startsWith("play")) {
      const query = cmd.replace(/play\s*/i, "").trim();
      const searchQuery = query.length > 0 ? query : "music";
      const searchUrl = `https://music.youtube.com/search?q=${encodeURIComponent(searchQuery)}`;
      return {
        type: "music",
        userInput: cmd,
        response: `Searching YouTube Music for "${searchQuery}"`,
        url: searchUrl,
        suggestions: ["Play jazz music", "Play classical music", "Play latest hits"]
      };
    }

    const matchMap = [
      {
        match: ["search youtube for", "youtube search", "find on youtube", "youtube video of"],
        type: "youtube-search",
        response: (cmd) => {
          const query = cmd.replace(/(search youtube for|youtube search|find on youtube|youtube video of)/i, "").trim();
          return `Searching YouTube for "${query}"`;
        },
        url: (cmd) => {
          const query = cmd.replace(/(search youtube for|youtube search|find on youtube|youtube video of)/i, "").trim();
          return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        },
        suggestions: ["Search YouTube for coding tutorials", "Search YouTube for relaxing music"]
      },
      {
        match: ["open calculator", "calculator", "calculate", "math"],
        type: "calculator-open",
        response: "Opening calculator...",
        url: "https://www.google.com/search?q=calculator",
        suggestions: ["Calculate 25*4", "What is 15% of 200?"]
      },
      {
        match: ["open instagram", "instagram", "insta"],
        type: "instagram-open",
        response: "Opening Instagram...",
        url: "https://www.instagram.com/",
        suggestions: ["Open my Instagram profile", "Search Instagram for cats"]
      },
      {
        match: ["open facebook", "facebook", "fb"],
        type: "facebook-open",
        response: "Opening Facebook...",
        url: "https://www.facebook.com/",
        suggestions: []
      },
      {
        match: ["open email", "open gmail", "check mail", "email", "gmail"],
        type: "email-open",
        response: "Opening Gmail...",
        url: "https://mail.google.com/",
        suggestions: ["Check unread emails", "Compose new email"]
      },
      {
        match: ["open calendar", "show calendar", "calendar"],
        type: "calendar-open",
        response: "Opening Calendar...",
        url: "https://calendar.google.com/",
        suggestions: ["What's on my calendar today?", "Add event to calendar"]
      },
      {
        match: ["what day", "today's day", "day today", "current day"],
        type: "get-day",
        response: `Today is ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`,
        suggestions: ["What's the date?", "What time is it?"],
        url: null
      },
      {
        match: ["what time", "current time", "time now", "time"],
        type: "get-time",
        response: `The time is ${new Date().toLocaleTimeString()}`,
        suggestions: ["What's today's date?", "Set an alarm"],
        url: null
      },
      {
        match: ["what date", "today's date", "current date", "date today"],
        type: "get-date",
        response: `Today's date is ${new Date().toLocaleDateString()}`,
        suggestions: ["What day is it?", "Days until Christmas"],
        url: null
      },
      {
        match: ["open youtube", "youtube", "watch video", "videos"],
        type: "youtube-open",
        response: "Opening YouTube...",
        url: "https://www.youtube.com/",
        suggestions: ["Search YouTube for tutorials", "Play trending videos"]
      },
      {
        match: ["search", "find", "look up", "search for", "google"],
        type: "google-search",
        response: (cmd) => `Searching Google for ${cmd.replace(/(search|find|look up|google|for)/gi, "").trim()}`,
        url: (cmd) => `https://www.google.com/search?q=${encodeURIComponent(cmd.replace(/(search|find|look up|google|for)/gi, "").trim())}`,
        suggestions: ["Search for AI trends", "Find nearby coffee shops"]
      },
      {
        match: ["news", "today's news", "current news", "headlines"],
        type: "news-show",
        response: "Showing today's top news headlines...",
        url: "https://news.google.com/",
        suggestions: ["Tech news", "Sports news", "Business news"]
      },
      {
        match: ["weather", "weather today", "weather forecast"],
        type: "weather-show",
        response: "Showing weather information...",
        url: "https://www.google.com/search?q=weather",
        suggestions: ["Weather in New York", "Weekly forecast"]
      },
      {
        match: ["maps", "google maps", "location", "find location"],
        type: "maps-search",
        response: "Opening Google Maps...",
        url: "https://www.google.com/maps",
        suggestions: ["Directions to airport", "Find coffee shops nearby"]
      },
      {
        match: ["define", "what is", "who is"],
        type: "definition",
        response: (cmd) => `Searching for definition of ${cmd.replace(/(define|what is|who is)/gi, "").trim()}`,
        url: (cmd) => `https://www.google.com/search?q=define+${encodeURIComponent(cmd.replace(/(define|what is|who is)/gi, "").trim())}`,
        suggestions: ["Define artificial intelligence", "What is blockchain?"]
      }
    ];

    for (const item of matchMap) {
      const matchedKeyword = item.match.find(keyword => lowerCmd.includes(keyword));
      if (matchedKeyword) {
        return {
          type: item.type,
          userInput: cmd,
          response: typeof item.response === 'function' ? item.response(cmd) : item.response,
          url: typeof item.url === 'function' ? item.url(cmd) : item.url,
          suggestions: item.suggestions || []
        };
      }
    }

    return {
      type: "general",
      userInput: cmd,
      response: "I'm not sure how to help with that. Here are some things I can do:",
      suggestions: promptSuggestions,
      url: null
    };
  };

  try {
    const localResponse = getLocalResponse(command);
    if (localResponse.type !== 'general') return localResponse;

    if (!process.env.GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
      return localResponse;
    }

    const prompt = `
You are ${assistantName}, a helpful AI assistant. User: ${userName}

Respond with JSON in this format:
{
  "type": "command-type",
  "response": "your_response",
  "url": "optional_url",
  "suggestions": ["next", "possible", "prompts"]
}

Available command types:
- calculator-open, instagram-open, email-open
- google-search, weather-show, maps-search
- news-show, youtube-open, music-play
- get-time, get-date, get-day
- reminder-set, definition

User command: "${command}"
    `;

    const response = await axios.post(
      process.env.GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: prompt }], role: "user" }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
        },
        timeout: 5000
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return localResponse;

    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) return localResponse;

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.response || !parsed.type) throw new Error("Invalid response structure");

      return {
        type: parsed.type,
        userInput: command,
        response: parsed.response,
        url: parsed.url || null,
        suggestions: parsed.suggestions || promptSuggestions.slice(0, 5)
      };
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return localResponse;
    }
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    return getLocalResponse(command);
  }
};

export default geminiResponse;
