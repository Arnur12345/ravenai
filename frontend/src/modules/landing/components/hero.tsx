import { useNavigate } from 'react-router-dom';
import ldbackground from '@/assets/ldbackground.png';
import lddemo from '@/assets/ravenscreen.png';
import peerlistLogo from '@/assets/peerlist.svg';
import silverLogo from '@/assets/silver.svg';
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative w-full min-h-screen bg-black overflow-hidden pb-8 flex items-center justify-center px-4 sm:px-6">
      {/* Main Background Container - Contains everything */}
      <div 
        className="relative w-full max-w-[1400px] mx-auto rounded-[14px] sm:rounded-[20px] overflow-hidden"
        style={{
          height: 'auto',
          minHeight: '600px',
          aspectRatio: '1080 / 1920',
          maxHeight: '90vh',
          backgroundImage: `url(${ldbackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Content Container - All text and elements inside background */}
        <div className="relative w-full h-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
          
          {/* Text Content Section - Upper portion */}
          <div className="w-full flex flex-col items-center text-center space-y-4 sm:space-y-6 pt-8 sm:pt-12">
            {/* Logos */}
            <div className="mb-2 sm:mb-4 flex items-center justify-center gap-4 sm:gap-6">
              <a 
                href="https://peerlist.io/artykbay/project/ravenaicreate"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img 
                  src={peerlistLogo}
                  alt="Peerlist" 
                  className="h-6 sm:h-8 md:h-10 lg:h-12 opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </a>
              <img 
                src={silverLogo} 
                alt="Silver" 
                className="h-6 sm:h-8 md:h-10 lg:h-12 opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            
            {/* Main Heading */}
            <h1 
              className="text-white text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-normal leading-[1.2em] tracking-[-0.02em] max-w-full px-2 sm:px-4"
              style={{
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              Never Type <br className="sm:hidden" />Meeting Notes
            </h1>
            
            {/* Subheading */}
            <p 
              className="text-white text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-normal leading-[1.4em] max-w-[280px] sm:max-w-[400px] lg:max-w-[500px] px-2 sm:px-4"
              style={{
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              Get ready-to-send summaries in seconds with AI transcription and smart formatting.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 w-full max-w-[600px] justify-center items-center">
              {/* Get Started Button */}
              <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                {/* Shade/Glow Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80 transition-opacity">
                  <div 
                    className="absolute inset-0 rounded-[9px]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      filter: 'blur(0px)',
                    }}
                  />
                </div>
                
                {/* Gradient Border Effect */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, #9D9D9D 0%, #FFFFFF 61.54%, #D8D8D8 100%)',
                    borderRadius: '9px',
                    padding: '1px'
                  }}
                >
                  <div 
                    className="w-full h-full bg-black"
                    style={{
                      borderRadius: '8px'
                    }}
                  />
                </div>
                
                {/* Button Content */}
                <button 
                  onClick={() => navigate('/auth')}
                  className="relative bg-white hover:bg-gray-100 transition-colors duration-200 w-full sm:w-[180px] lg:w-[200px] xl:w-[244px] h-[44px] sm:h-[48px] lg:h-[60px]"
                  style={{
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span 
                    className="text-black text-sm sm:text-base lg:text-lg xl:text-[20.98px]"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'normal',
                      lineHeight: '1.5em'
                    }}
                  >
                    Get started
                  </span>
                </button>
              </div>
              
              {/* View Demo Button */}
              <div className="relative w-full sm:w-auto sm:flex-shrink-0">
                {/* Shade/Glow Effect */}
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-80 transition-opacity">
                  <div 
                    className="absolute inset-0 rounded-[9px]"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      filter: 'blur(0px)',
                    }}
                  />
                </div>
                
                {/* Gradient Border */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, #9C9C9C 0%, #ABABAB 61.54%, #979797 100%)',
                    borderRadius: '9px',
                    padding: '1px'
                  }}
                >
                  <div 
                    className="w-full h-full bg-black"
                    style={{
                      borderRadius: '8px'
                    }}
                  />
                </div>
                
                {/* Button Content */}
                <button 
                  onClick={() => window.open('https://drive.google.com/file/d/188a495PAykmMw4QF-0o6Ze3bEL8dmmMI/view?usp=sharing', '_blank')}
                  className="relative bg-transparent hover:bg-white/5 transition-colors duration-200 w-full sm:w-[180px] lg:w-[200px] xl:w-[244px] h-[44px] sm:h-[48px] lg:h-[60px]"
                  style={{
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span 
                    className="text-white text-sm sm:text-base lg:text-lg xl:text-[17.63px]"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'normal',
                      lineHeight: '1.5em'
                    }}
                  >
                    View Demo
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Demo Image Section - Lower portion, contained within background - Hidden on mobile */}
          <div className="hidden sm:flex w-full items-center justify-center mt-8 sm:mt-10 lg:mt-16 pb-4 sm:pb-6">
            <div 
              className="rounded-[8px] sm:rounded-[10px] lg:rounded-[17px] w-full max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] xl:max-w-[900px]"
              style={{
                aspectRatio: '1178 / 527',
                height: 'auto',
                maxHeight: '300px',
                minHeight: '150px',
                backgroundImage: `url(${lddemo})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;