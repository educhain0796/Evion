import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left Side: Logo and Description */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <h2 className="text-white text-2xl font-semibold mb-2">Evion</h2>
            <p className="text-sm">Connecting people to amazing events and opportunities worldwide.</p>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex space-x-6 mb-6 md:mb-0">
            <a href="#" className="hover:text-white">About Us</a>
            <a href="#" className="hover:text-white">Careers</a>
            <a href="#" className="hover:text-white">Contact</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>

          {/* Right Side: Social Media Icons */}
          <div className="flex space-x-4">
            <a href="#" className="hover:text-white" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-white" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" className="hover:text-white" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-white" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
        </div>

        {/* Bottom Row: Copyright */}
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Evion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
