import React, { useContext, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const { userData, selectedImage, serverUrl, setUserData } = useContext(userDataContext);
    const [assistantName, setAssistantName] = useState(userData?.AssistantName || "");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdateAssistant = async () => {
        setLoading(true);
        try {
            const result = await axios.post(
                `${serverUrl}/api/user/update`,
                {
                    assistantName,
                    imageUrl: selectedImage
                },
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            setUserData(result.data);
            navigate("/");
        } catch (error) {
            console.log("Update error:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full min-h-screen bg-gradient-to-b from-[#0a002e] to-[#050014] flex flex-col items-center justify-center py-12 px-4 relative text-white'>

            <MdKeyboardBackspace 
                className='absolute top-6 left-6 text-white cursor-pointer w-8 h-8 hover:text-purple-300 transition-colors'
                onClick={() => navigate("/customize")}
            />

            <div className="relative mb-8">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg shadow-purple-800">
                    <img 
                        src={selectedImage} 
                        alt="Selected Assistant" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -top-3 -left-3 w-44 h-44 bg-purple-500 opacity-20 blur-3xl rounded-full animate-pulse -z-10" />
            </div>

            <div className='w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl'>

                <h1 className='text-4xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 text-transparent bg-clip-text mb-2'>
                    Name Your Assistant
                </h1>

                <p className='text-gray-300 text-center mb-6'>
                    Give your AI companion a unique personality
                </p>

                {assistantName && (
                    <p className='text-center text-sm text-purple-400 mb-4 italic tracking-wide'>
                        Let’s bring <span className="font-semibold text-pink-400">{assistantName}</span> to life!
                    </p>
                )}

                <input 
                    type="text"
                    placeholder='e.g. Athena, Nova, Orion'
                    className='w-full bg-gray-900/70 border border-gray-700 text-white px-6 py-4 rounded-full text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6'
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                />

                {assistantName && (
                    <button 
                        onClick={handleUpdateAssistant}
                        disabled={loading}
                        className={`w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center
                            ${loading 
                                ? 'bg-purple-800/50 text-white cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Finalize Your Assistant'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default Customize2;
