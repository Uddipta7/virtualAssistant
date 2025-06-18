import React, { useContext } from 'react';
import Card from '../components/Card';
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import image8 from "../assets/image8.png";
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from "react-icons/md";

function Customize() {
  const { selectedImage } = useContext(userDataContext);
  const navigate = useNavigate();

  return (
    <div className='w-full min-h-screen bg-gradient-to-b from-[#0a002e] to-[#050014] flex flex-col items-center py-12 px-4 relative text-white overflow-hidden'>

      <div className="absolute top-0 left-0 w-60 h-60 bg-purple-500 opacity-20 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 opacity-20 blur-2xl rounded-full -z-10"></div>

      <button 
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-purple-400 transition-colors z-50"
      >
        <MdKeyboardBackspace className='w-8 h-8' />
        <span className="font-bold text-lg hidden sm:inline">BACK</span>
      </button>

      <div className="text-center mb-16">
        <h1 className='text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 text-transparent bg-clip-text drop-shadow-lg mb-3'>
          Pick the face of your AI
        </h1>
        <p className="text-gray-300 text-lg">Choose your perfect AI companion</p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-10 max-w-5xl mx-auto mb-16'>
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <Card image={image8} />
      </div>

      {selectedImage && (
        <button
          onClick={() => navigate("/customize2")}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-pink-600 hover:to-purple-500 text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
        >
          Select Avatar
        </button>
      )}
    </div>
  );
}

export default Customize;
