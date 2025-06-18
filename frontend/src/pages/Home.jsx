import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";


function parseTimeString(timeStr) {
  const time = timeStr.toLowerCase().trim();
  const now = new Date();
  
 
  if (time.match(/^\d{1,2}(:\d{2})?\s?(am|pm)?$/i)) {
    let [hours, minutes] = time.replace(/[ap]m/i, '').split(':');
    hours = parseInt(hours, 10);
    minutes = minutes ? parseInt(minutes, 10) : 0;
    
    if (time.includes('pm') && hours < 12) hours += 12;
    if (time.includes('am') && hours === 12) hours = 0;
    
    now.setHours(hours, minutes, 0, 0);
    return now;
  }
  
  
  if (time.match(/^\d{1,2}:\d{2}$/)) {
    const [hours, minutes] = time.split(':').map(Number);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      now.setHours(hours, minutes, 0, 0);
      return now;
    }
  }
  
  return null;
}


const useTypewriter = (text, speed = 40) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      return;
    }

    let i = 0;
    
    setDisplayedText("");
    
    
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(prev => {
         
          if (i < text.length) {
            const newText = prev + text.charAt(i);
            i++;
            return newText;
          }
         
          clearInterval(interval);
          return prev;
        });
      }, speed);

      return () => clearInterval(interval);
    }, 50); 
    return () => {
      clearTimeout(timeout);
    };
  }, [text, speed]);

  return displayedText;
};

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [language, setLanguage] = useState("english");
  const [suggestions, setSuggestions] = useState([]);
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [started, setStarted] = useState(false);
  const synth = window.speechSynthesis;
  const [reminderData, setReminderData] = useState({
    time: '',
    message: ''
  });
  const [activeReminder, setActiveReminder] = useState(null);
  const [reminders, setReminders] = useState([]);

  const typewriterAiText = useTypewriter(aiText);

  const defaultSuggestions = [
    "What can you do?",
    "Open calculator",
    "Show today's news",
    "Tell me a joke",
    "What time is it?",
    "Search for AI trends",
    "Open YouTube",
    "Show weather forecast",
    "Open Google Maps",
    "Set a reminder for meeting at 3pm",
  
  ];

 
  useEffect(() => {
    const savedReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    if (savedReminders.length > 0) {
      setReminders(savedReminders);
    }
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const requestSpeechPermission = () => {
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance('');
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      synth.speak(utterance);
    });
  };

  const speak = async (text) => {
    if (!text || isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    setStatus("Speaking...");
    setAiText(text);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const hasPermission = await requestSpeechPermission();
      if (!hasPermission) {
        setError("Speech synthesis permission denied");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = language === "hindi" ? "hi-IN" : language === "bengali" ? "bn-IN" : "en-US";
      utterance.lang = langCode;

      const voices = synth.getVoices();
      if (voices.length === 0) await new Promise(res => synth.onvoiceschanged = res);
      const selectedVoice = synth.getVoices().find(v => v.lang === langCode) || synth.getVoices()[0];
      utterance.voice = selectedVoice;

      utterance.onerror = (e) => {
        console.error("Speech error:", e);
        setError(`Speech error: ${e.error}`);
        isSpeakingRef.current = false;
        setStatus("Ready");
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setStatus("Ready");
        startRecognition();
      };

      synth.cancel();
      synth.speak(utterance);
    } catch (err) {
      console.error("Speak failed:", err);
      isSpeakingRef.current = false;
      setStatus("Ready");
      setError("Speech synthesis failed");
    }
  };

  const startRecognition = () => {
    if (isSpeakingRef.current || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setStatus("Listening...");
      setError(null);
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
        setError("Recognition start failed");
      }
    }
  };

  const handleCommand = async (command) => {
    setStatus("Processing...");
    setUserText(command);

    try {
      let data;
      const lowerCommand = command.toLowerCase();

      
      if (lowerCommand.includes('reminder') || lowerCommand.includes('set a reminder') || lowerCommand.includes('remind me')) {
        const reminderMatch = command.match(/set a reminder for (.+) at (.+)/i) || 
                             command.match(/remind me to (.+) at (.+)/i) ||
                             command.match(/reminder for (.+) at (.+)/i);
        
        if (reminderMatch) {
          const [, message, timeStr] = reminderMatch;
          const time = parseTimeString(timeStr);
          
          if (!time) {
            data = {
              response: "I couldn't understand that time format. Please try something like '3pm' or '14:30'.",
              suggestions: [
                "Remind me to call John at 3pm",
                "Set a reminder for meeting at 2:30pm",
                "Remind me about the appointment tomorrow at 10am"
              ]
            };
          } else {
            const reminder = {
              time: time.toString(),
              message,
              active: true,
              id: Date.now()
            };
            
            const updatedReminders = [...reminders, reminder];
            setReminders(updatedReminders);
            localStorage.setItem('reminders', JSON.stringify(updatedReminders));
            
            data = {
              response: `I've set a reminder for "${message}" at ${timeStr}.`,
              type: 'reminder-set',
              time: time.toString(),
              message
            };
          }
        } else {
          data = {
            response: "Please specify what you want to be reminded about and the time. Example: 'Remind me to call John at 3pm'",
            suggestions: [
              "Remind me to call John at 3pm",
              "Set a reminder for meeting at 2:30pm",
              "Remind me about the appointment tomorrow at 10am"
            ]
          };
        }
      } 
      
      else if (lowerCommand.includes('news')) {
        if (lowerCommand.includes('business') || lowerCommand.includes('finance')) {
          data = {
            response: "Here are the latest business news headlines:",
            type: 'news',
            category: 'business',
            url: 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
          };
        } else if (lowerCommand.includes('sports') || lowerCommand.includes('sport')) {
          data = {
            response: "Here are the latest sports news headlines:",
            type: 'news',
            category: 'sports',
            url: 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
          };
        } else if (lowerCommand.includes('tech') || lowerCommand.includes('technology')) {
          data = {
            response: "Here are the latest technology news headlines:",
            type: 'news',
            category: 'technology',
            url: 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en'
          };
        } else {
          data = await getGeminiResponse(command, userData?.assistantName, userData?.name, language);
          if (!data || !data.response) {
            data = {
              response: "Would you like business, sports, or technology news?",
              suggestions: [
                "Show business news",
                "Show sports news",
                "Show technology news",
                "Show entertainment news"
              ]
            };
          }
        }
      }
      
      else {
        data = await getGeminiResponse(command, userData?.assistantName, userData?.name, language);
        
        
        if (!data || !data.response) {
          if (lowerCommand.includes('day')) data.response = `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`;
          else if (lowerCommand.includes('time')) data.response = `The time is ${new Date().toLocaleTimeString()}`;
          else if (lowerCommand.includes('date')) data.response = `Today's date is ${new Date().toLocaleDateString()}`;
          else data.response = "I'm not sure how to help with that. Here are some things I can do:";
        }
      }

     
      if (data.type === 'reminder-set') {
        setActiveReminder({
          time: data.time,
          message: data.message,
          active: true
        });
      }

      await speak(data.response);
      setSuggestions(data.suggestions || defaultSuggestions);

    
      if (data.url) window.open(data.url, "_blank");

      const q = encodeURIComponent(data.userInput || "");
      const routes = {
        'google-search': `https://www.google.com/search?q=${q}`,
        'youtube-search': `https://www.youtube.com/results?search_query=${q}`,
        'calculator-open': `https://www.google.com/search?q=calculator`,
        'maps-search': `https://www.google.com/maps/search/${q}`,
        'translate': `https://translate.google.com/?sl=auto&tl=en&text=${q}`,
        'wikipedia-search': `https://en.wikipedia.org/wiki/Special:Search?search=${q}`,
        'news': `https://news.google.com/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
      };

      const url = routes[data.type];
      if (url) window.open(url, "_blank");

    } catch (err) {
      console.error("Error handling command:", err);
      setError("Assistant unavailable");
      setSuggestions(defaultSuggestions);
      await speak("Sorry, I am not able to process that");
    }
  };

  
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const currentHours = now.getHours();
      
      const activeReminders = reminders.filter(reminder => reminder.active);
      
      activeReminders.forEach(reminder => {
        const reminderTime = new Date(reminder.time);
        const reminderMinutes = reminderTime.getMinutes();
        const reminderHours = reminderTime.getHours();
        
       
        if (currentHours === reminderHours && 
            Math.abs(currentMinutes - reminderMinutes) <= 1) {
          
          speak(`Reminder: ${reminder.message}`);
          
          
          const updatedReminders = reminders.map(r => 
            r.id === reminder.id ? {...r, active: false} : r
          );
          
          setReminders(updatedReminders);
          localStorage.setItem('reminders', JSON.stringify(updatedReminders));
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders]);

  const greet = async () => {
    if (!userData) return;
    setStarted(true);
    await speak(`Hello ${userData.name}, I'm ${userData.assistantName}. How can I help you?`);
    setSuggestions(defaultSuggestions);
    startRecognition();
  };

  useEffect(() => {
    if (!userData) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      isRecognizingRef.current = true;
      setStatus("Listening...");
      setError(null);
    };

    recognition.onend = () => {
      setListening(false);
      isRecognizingRef.current = false;
      setStatus("Ready");
      if (!isSpeakingRef.current) {
        setTimeout(startRecognition, 1000);
      }
    };

    recognition.onerror = (e) => {
      console.error("Recognition error:", e);
      setListening(false);
      isRecognizingRef.current = false;
      setStatus("Error");
      setError(`Recognition error: ${e.error}`);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setUserText(transcript);
      recognition.stop();
      handleCommand(transcript);
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      synth.cancel();
    };
  }, [userData]);

  if (!userData) return <div className="text-white">Loading...</div>;

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex flex-col md:flex-row overflow-hidden relative'>
    
      <div className="flex-1 flex flex-col items-center justify-center p-4 order-1 md:order-2 w-full">
        
        <div className="hidden lg:flex gap-4 absolute top-6 right-6 z-50">
          <button 
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-5 py-2 rounded-full shadow-lg hover:shadow-purple-400/50 transition-all hover:scale-105"
            onClick={() => navigate("/customize")}
          >
            ✨ Customize
          </button>
          <button 
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-full shadow-lg hover:shadow-red-400/50 transition-all hover:scale-105"
            onClick={handleLogOut}
          >
            🔒 Logout
          </button>
        </div>

        {!started ? (
  <div className="flex flex-col items-center justify-center gap-8 p-8 bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl w-full max-w-md mx-auto ml-8 md:ml-12">
    <button
      onClick={greet}
      className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl px-10 py-5 rounded-full shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 group"
    >
      <span className="relative z-10">🌟 Start Assistant</span>
      <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      <span className="absolute -inset-1 bg-white/20 blur-md group-hover:blur-lg transition-all duration-500"></span>
    </button>
    <img
      src={userImg}
      alt="User"
      className="w-40 h-40 rounded-full shadow-lg border-4 border-white/20 object-cover"
    />
    <p className="text-white/80 text-sm font-light tracking-wider">"Ready to assist you!"</p>
  </div>
) : (
          <>
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <img 
                src={userData?.assistantImage} 
                alt="assistant" 
                className="w-48 h-48 rounded-full object-cover border-4 border-white/30 shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h1 className='text-white text-2xl font-medium tracking-wide mt-4'>
              I'm <span className="text-purple-300">{userData?.assistantName}</span>
            </h1>

            {listening && !isSpeakingRef.current && (
              <div className="flex gap-1 h-[40px] mt-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-[5px] bg-white animate-pulse" style={{ animationDelay: `${i * 0.1}s`, height: '100%' }}></div>
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-3 mt-4 w-full max-w-[500px]">
              {userText && (
                <div className="self-end bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md max-w-[80%] text-right">{userText}</div>
              )}
              {aiText && (
                <div className="self-start bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md max-w-[80%] text-left">
                  {typewriterAiText}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Type something..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCommand(userText);
                  setUserText("");
                }
              }}
              className="mt-4 px-4 py-2 rounded-full text-black w-[300px] max-w-[90%]"
            />

            <div className="absolute bottom-4 text-white">Status: {status}</div>
          </>
        )}
      </div>

      
      <div className="w-full md:w-64 bg-gray-900/50 backdrop-blur-md p-4 order-2 md:order-1">
        <h3 className="text-white font-semibold mb-4">Try asking me:</h3>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                setUserText(suggestion);
                handleCommand(suggestion);
              }}
              className="w-full text-left bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;