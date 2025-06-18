import React, { useContext } from 'react';
import { userDataContext } from '../context/UserContext';
import { motion } from 'framer-motion';

function Card({ image }) {
  const { selectedImage, setSelectedImage, setBackendImage, setFrontendImage } = useContext(userDataContext);

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`relative w-40 h-40 rounded-full overflow-hidden border-4 transition-all duration-300 cursor-pointer
        ${selectedImage === image 
          ? 'border-purple-500 shadow-lg shadow-purple-500/40' 
          : 'border-gray-600 hover:border-purple-400'
        }`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img 
        src={image} 
        className="w-full h-full object-cover" 
        alt="Avatar option"
      />
      {selectedImage === image && (
        <div className="absolute inset-0 bg-purple-900/30"></div>
      )}
    </motion.div>
  );
}

export default Card;
