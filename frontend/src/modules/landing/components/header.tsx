import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import ravenLogo from '@/assets/ravenwhite.png';
import gilroyFont from '@/assets/gilroy.ttf';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { useTheme } from '@/shared/contexts/ThemeContext';

const Header = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Load Gilroy font
    const fontFace = new FontFace('Gilroy', `url(${gilroyFont})`);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
    });

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Theme-based classes
  const getThemeClasses = () => {
    return {
      container: theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700/50' 
        : 'bg-[#383735] border-[#3d3d3d]',
      logo: theme === 'dark' ? 'brightness-200' : 'brightness-110',
      navText: theme === 'dark' ? 'text-gray-200 group-hover:text-white' : 'text-white/92 group-hover:text-white',
      navHover: theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-white/5',
      gradientOverlay: theme === 'dark' 
        ? 'from-gray-600/30 to-gray-500/40' 
        : 'from-white/5 to-white/10',
      createButton: theme === 'dark'
        ? 'bg-gray-700/80 border-gray-600/50'
        : 'bg-[#4d4d4d] border-[#454545]',
      mobileButton: theme === 'dark' 
        ? 'text-gray-200 hover:text-white hover:bg-gray-700/50' 
        : 'text-white/92 hover:text-white hover:bg-white/5',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <header 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl transition-all duration-700 ease-out ${
        isLoaded 
          ? 'blur-0 opacity-100 translate-y-0' 
          : 'blur-sm opacity-0 -translate-y-2'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl">
        {/* Main glassmorphic container */}
        <div 
          className={`relative ${themeClasses.container} backdrop-blur-[5px] border rounded-2xl px-8 py-4`}
          style={{
            boxShadow: `
              rgba(0, 0, 0, 0.02) 0px 0.796192px 0.796192px -0.9375px,
              rgba(0, 0, 0, 0.02) 0px 2.41451px 2.41451px -1.875px,
              rgba(0, 0, 0, 0.02) 0px 6.38265px 6.38265px -2.8125px,
              rgba(0, 0, 0, 0.01) 0px 20px 20px -3.75px,
              rgba(0, 0, 0, 0.09) 0px 0.722625px 0.722625px -1px,
              rgba(0, 0, 0, 0.08) 0px 2.74624px 2.74624px -2px,
              rgba(0, 0, 0, 0.06) 0px 12px 12px -3px,
              rgba(255, 255, 255, 0.53) 0px -0.796192px 2.0701px -1.25px inset,
              rgba(255, 255, 255, 0.48) 0px -2.41451px 6.27772px -2.5px inset,
              rgba(255, 255, 255, 0.37) 0px -6.38265px 16.5949px -3.75px inset,
              rgba(255, 255, 255, 0) 0px -20px 52px -5px inset
            `
          }}
        >
          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
              backgroundSize: '128px',
              backgroundRepeat: 'repeat',
              backgroundPosition: 'left top'
            }}
          />
          
          <div className="relative flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <a 
                href="./" 
                className="flex items-center group transition-all duration-200 hover:scale-[1.02]"
              >
                <img 
                  src={ravenLogo} 
                  alt="Raven Logo" 
                  className={`h-12 w-auto object-contain ${themeClasses.logo} ml-2`}
                />
              </a>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                { key: 'nav.integrations', href: '#integrations' },
                { key: 'nav.reviews', href: '#reviews' },
                { key: 'nav.pricing', href: '#pricing' },
                { key: 'nav.faq', href: '#faq' }
              ].map((item) => (
                <a 
                  key={item.key}
                  href={item.href}
                  className={`relative group px-4 py-2.5 rounded-xl transition-all duration-200 ${themeClasses.navHover}`}
                >
                  <span 
                    className={`text-base font-medium ${themeClasses.navText} transition-colors duration-200`}
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    {t(item.key)}
                  </span>
                  <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.gradientOverlay} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                </a>
              ))}
              
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                className={`relative group px-4 py-2.5 rounded-xl transition-all duration-200 ${themeClasses.navHover} ml-2`}
              >
                <span 
                  className={`text-sm font-medium ${themeClasses.navText} transition-colors duration-200`}
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {t('language.switch')}
                </span>
                <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.gradientOverlay} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
              </button>

              {/* Theme Toggle Button - Beautiful Design */}
              <button
                onClick={toggleTheme}
                className="relative group overflow-hidden rounded-xl ml-2"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div 
                  className={`relative ${themeClasses.createButton} border rounded-xl px-3 py-2.5 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center`}
                  style={{
                    boxShadow: `
                      rgba(0, 0, 0, 0.47) 0px 0.722625px 0.722625px -1.25px inset,
                      rgba(0, 0, 0, 0.41) 0px 2.74624px 2.74624px -2.5px inset,
                      rgba(0, 0, 0, 0.16) 0px 12px 12px -3.75px inset,
                      rgba(0, 0, 0, 0.16) 0px 0.722625px 0.722625px -1.25px,
                      rgba(0, 0, 0, 0.14) 0px 2.74624px 2.74624px -2.5px,
                      rgba(0, 0, 0, 0.06) 0px 12px 12px -3.75px
                    `
                  }}
                >
                  {/* Icon container with smooth transition */}
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun 
                      className={`absolute w-5 h-5 text-yellow-400 transition-all duration-500 ${
                        theme === 'dark' 
                          ? 'opacity-100 rotate-0 scale-100' 
                          : 'opacity-0 rotate-180 scale-0'
                      }`}
                    />
                    <Moon 
                      className={`absolute w-5 h-5 text-blue-300 transition-all duration-500 ${
                        theme === 'dark' 
                          ? 'opacity-0 -rotate-180 scale-0' 
                          : 'opacity-100 rotate-0 scale-100'
                      }`}
                    />
                  </div>
                  
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                </div>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                  theme === 'dark' 
                    ? 'bg-yellow-400/20 shadow-lg shadow-yellow-400/20' 
                    : 'bg-blue-400/20 shadow-lg shadow-blue-400/20'
                }`} />
              </button>
            </nav>

            {/* Try out Button */}
            <div className="flex items-center space-x-3">
              <a 
                href="/register"
                target="_blank"
                rel="noopener"
                className="group relative overflow-hidden rounded-xl"
              >
                <div 
                  className={`relative ${themeClasses.createButton} border rounded-xl px-5 py-2.5 transition-all duration-200 hover:scale-[1.02] flex items-center space-x-2`}
                  style={{
                    boxShadow: `
                      rgba(0, 0, 0, 0.47) 0px 0.722625px 0.722625px -1.25px inset,
                      rgba(0, 0, 0, 0.41) 0px 2.74624px 2.74624px -2.5px inset,
                      rgba(0, 0, 0, 0.16) 0px 12px 12px -3.75px inset,
                      rgba(0, 0, 0, 0.16) 0px 0.722625px 0.722625px -1.25px,
                      rgba(0, 0, 0, 0.14) 0px 2.74624px 2.74624px -2.5px,
                      rgba(0, 0, 0, 0.06) 0px 12px 12px -3.75px
                    `
                  }}
                >
                  <span 
                    className="text-base font-medium text-white relative z-10"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    {t('nav.try_out')}
                  </span>
                  <svg 
                    className="w-4 h-4 text-white relative z-10 group-hover:translate-x-0.5 transition-transform duration-200" 
                    fill="currentColor" 
                    viewBox="0 0 256 256"
                  >
                    <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
                  </svg>
                  
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${themeClasses.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                </div>
              </a>

              {/* Mobile Menu Button */}
              <button 
                className={`md:hidden p-2.5 rounded-xl transition-all duration-200 ${themeClasses.mobileButton}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 relative overflow-hidden rounded-2xl">
          <div 
            className={`${themeClasses.container} backdrop-blur-[5px] border rounded-2xl p-4`}
            style={{
              boxShadow: `
                rgba(0, 0, 0, 0.02) 0px 0.796192px 0.796192px -0.9375px,
                rgba(0, 0, 0, 0.02) 0px 2.41451px 2.41451px -1.875px,
                rgba(0, 0, 0, 0.02) 0px 6.38265px 6.38265px -2.8125px,
                rgba(0, 0, 0, 0.01) 0px 20px 20px -3.75px,
                rgba(0, 0, 0, 0.09) 0px 0.722625px 0.722625px -1px,
                rgba(0, 0, 0, 0.08) 0px 2.74624px 2.74624px -2px,
                rgba(0, 0, 0, 0.06) 0px 12px 12px -3px
              `
            }}
          >
            {/* Noise texture overlay for mobile menu */}
            <div 
              className="absolute inset-0 opacity-[0.12] pointer-events-none"
              style={{
                backgroundImage: 'url("https://framerusercontent.com/images/6mcf62RlDfRfU61Yg5vb2pefpi4.png")',
                backgroundSize: '128px',
                backgroundRepeat: 'repeat',
                backgroundPosition: 'left top'
              }}
            />
            
            <div className="relative space-y-3">
              {[
                { key: 'nav.integrations', href: '#integrations' },
                { key: 'nav.reviews', href: '#reviews' },
                { key: 'nav.pricing', href: '#pricing' },
                { key: 'nav.faq', href: '#faq' }
              ].map((item) => (
                <a 
                  key={item.key}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl transition-all duration-200 ${themeClasses.navHover}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span 
                    className={`text-base font-medium ${themeClasses.navText} transition-colors duration-200`}
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    {t(item.key)}
                  </span>
                </a>
              ))}
              
              <div className="flex space-x-3 pt-2">
                {/* Language Switcher Mobile */}
                <button
                  onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                  className={`flex-1 px-4 py-3 rounded-xl transition-all duration-200 ${themeClasses.navHover}`}
                >
                  <span 
                    className={`text-sm font-medium ${themeClasses.navText} transition-colors duration-200`}
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    {t('language.switch')}
                  </span>
                </button>

                {/* Theme Toggle Mobile */}
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-3 rounded-xl transition-all duration-200 ${themeClasses.navHover} flex items-center justify-center`}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <Sun 
                      className={`absolute w-5 h-5 text-yellow-400 transition-all duration-500 ${
                        theme === 'dark' 
                          ? 'opacity-100 rotate-0 scale-100' 
                          : 'opacity-0 rotate-180 scale-0'
                      }`}
                    />
                    <Moon 
                      className={`absolute w-5 h-5 text-blue-300 transition-all duration-500 ${
                        theme === 'dark' 
                          ? 'opacity-0 -rotate-180 scale-0' 
                          : 'opacity-100 rotate-0 scale-100'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;