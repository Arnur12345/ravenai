import React from 'react';
import purpleSideImage from '@/assets/purpleside.svg';

const AuthRightSide: React.FC = () => {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-[#5138ED] via-[#4A2BC7] to-[#3521B5] flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-[90vh] flex items-center justify-center p-8">
        <img 
          src={purpleSideImage} 
          alt="Purple Side Design" 
          className="w-full h-auto max-w-full max-h-full object-contain opacity-95"
        />
      </div>
    </div>
  );
};

export default AuthRightSide; 