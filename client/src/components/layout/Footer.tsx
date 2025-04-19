import React from 'react';
import { Link } from 'wouter';
import { 
  Twitter, 
  Facebook, 
  Instagram,
  Github
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Cine<span className="text-primary">via</span></h3>
            <p className="text-gray-400 mb-4">Your ultimate destination for discovering, tracking, and sharing your movie journey.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">The Basics</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About FilmPulse</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact Us</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white">Support</Link></li>
              <li><Link href="/api" className="text-gray-400 hover:text-white">API</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link href="/guidelines" className="text-gray-400 hover:text-white">Guidelines</Link></li>
              <li><Link href="/discussions" className="text-gray-400 hover:text-white">Discussions</Link></li>
              <li><Link href="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
              <li><a href="https://twitter.com" className="text-gray-400 hover:text-white">Twitter</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Use</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/dmca" className="text-gray-400 hover:text-white">DMCA Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Cinevia. All rights reserved.</p>
          <p className="mt-2">Data provided by TMDB API. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
