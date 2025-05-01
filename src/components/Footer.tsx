import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Heart, ArrowUp, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function Footer() {
  const [email, setEmail] = useState("");
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "You've been added to our newsletter.",
      });
      setEmail("");
    }
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <footer className="bg-gradient-to-b from-white to-blue-50 border-t relative overflow-hidden">
      {/* Abstract shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-20 blur-2xl"></div>
        <div className="absolute top-1/2 right-[10%] w-64 h-64 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-16 left-[30%] w-48 h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      {/* Scroll to top button */}
      <button 
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-blue-50 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300 z-10"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="container py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="inline-block mb-4 group">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg transition-transform group-hover:scale-110 duration-300">A</div>
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">AIDIFY</span>
              </div>
            </Link>
            <p className="text-gray-600 mb-4 max-w-xs">
              Emergency first aid assistant powered by AI. Upload photos of injuries and get immediate first aid instructions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-600 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-600 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-600 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-600 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-5 text-gray-900 border-b border-gray-200 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Try Now
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-5 text-gray-900 border-b border-gray-200 pb-2">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/medical-chat" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Medical Chat
                </Link>
              </li>
              <li>
                <Link to="/injury-analysis" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Injury Analysis
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  First Aid Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-5 text-gray-900 border-b border-gray-200 pb-2">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-600 hover:text-purple-600 transition-colors inline-block hover:translate-x-1 duration-200">
                  Medical Disclaimer
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-5 text-gray-900 border-b border-gray-200 pb-2">Newsletter</h3>
            <p className="text-gray-600 mb-3 text-sm">Get the latest updates on first aid techniques and medical research.</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-r-none focus-visible:ring-purple-600/30"
                  required
                />
                <Button 
                  type="submit"
                  className="rounded-l-none bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground text-sm flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AIDIFY. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center gap-1">Made with <Heart className="h-3 w-3 text-red-500 animate-pulse" /> for better emergency response</p>
          <p className="mt-2 md:mt-0">This is not a substitute for professional medical advice. Always seek professional help in emergencies.</p>
        </div>
      </div>
    </footer>
  );
}
