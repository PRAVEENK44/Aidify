import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, PhoneCall, Home, Info, MessageSquare, BookOpen, Phone, Upload, User, LogOut, Settings, Brain, Heart, SparkleIcon, Sparkles, AlertCircle, Shield, Sun, Moon, Mic, BatteryFull, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initiateEmergencyCall } from '@/utils/deviceUtils';
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Global, css } from '@emotion/react';

interface NavItem {
  name: string;
  path: string;
  icon: JSX.Element;
}

const siteConfig = {
  name: "Aidify",
  description:
    "An AI-powered platform for healthcare guidance and first aid solutions.",
};

const mainNav: NavItem[] = [
  { name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
  { name: "App", path: "/app", icon: <Upload className="h-4 w-4" /> },
  { name: "About", path: "/about", icon: <Info className="h-4 w-4" /> },
  { name: "Blog", path: "/blog", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Contact", path: "/contact", icon: <Phone className="h-4 w-4" /> },
  { name: "AI Assistant", path: "/medical-chat", icon: <MessageSquare className="h-4 w-4" /> },
];

// Add health status interface
interface HealthStatus {
  heartRate: number;
  bloodPressure: string;
  activity: string;
  status: "normal" | "warning" | "critical";
  lastUpdated: Date;
}

// Add type for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInterface;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [deviceBattery, setDeviceBattery] = useState<number | null>(null);
  const [fallDetected, setFallDetected] = useState(false);
  const micRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const { user, isLoading, signOut, getUserProfile, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Add motion detection for emergency
  useEffect(() => {
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let timer: NodeJS.Timeout;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(acceleration - Math.sqrt(
        lastAcceleration.x * lastAcceleration.x + 
        lastAcceleration.y * lastAcceleration.y + 
        lastAcceleration.z * lastAcceleration.z
      ));
      
      // Detect sudden motion (potential fall)
      if (delta > 15) {
        setFallDetected(true);
        
        // Clear previous timer if exists
        if (timer) clearTimeout(timer);
        
        // Wait for user response before calling emergency
        timer = setTimeout(() => {
          toast({
            title: "Emergency Services Called",
            description: "No response received. Emergency services have been contacted.",
            variant: "destructive"
          });
          initiateEmergencyCall("108");
        }, 15000); // 15 seconds to respond
        
        // Show alert to user
        toast({
          title: "Fall Detected",
          description: "Are you okay? Emergency services will be called in 15 seconds. Tap to cancel.",
          variant: "destructive",
          action: (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFallDetected(false);
                clearTimeout(timer);
                toast({
                  title: "Emergency Call Cancelled",
                  description: "Glad you're okay!"
                });
              }}
              className="bg-white text-red-600 px-3 py-1.5 rounded-md font-medium"
            >
              I'm Fine
            </motion.button>
          ),
        });
      }
      
      lastAcceleration = { x, y, z };
    };
    
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    
    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Battery status monitoring
  useEffect(() => {
    const getBatteryStatus = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          setDeviceBattery(battery.level * 100);
          
          battery.addEventListener('levelchange', () => {
            setDeviceBattery(battery.level * 100);
          });
        }
      } catch (error) {
        console.error("Battery status not supported", error);
      }
    };
    
    getBatteryStatus();
  }, []);

  // Simulate health data updates
  useEffect(() => {
    // Simulate getting health data from wearable
    const simulateHealthData = () => {
      const heartRate = Math.floor(Math.random() * 30) + 60; // 60-90 bpm
      const systolic = Math.floor(Math.random() * 20) + 110; // 110-130
      const diastolic = Math.floor(Math.random() * 15) + 70; // 70-85
      
      let status: "normal" | "warning" | "critical" = "normal";
      if (heartRate > 100 || systolic > 140 || diastolic > 90) {
        status = "warning";
      }
      if (heartRate > 120 || systolic > 160 || diastolic > 100) {
        status = "critical";
      }
      
      const activities = ["resting", "walking", "active"];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      setHealthData({
        heartRate,
        bloodPressure: `${systolic}/${diastolic}`,
        activity,
        status,
        lastUpdated: new Date()
      });
    };
    
    simulateHealthData();
    const interval = setInterval(simulateHealthData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Voice command feature
  useEffect(() => {
    let recognition: SpeechRecognitionInterface | null = null;
    
    const setupSpeechRecognition = () => {
      try {
        // Check if browser supports speech recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onstart = () => {
            setIsListening(true);
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };
          
          recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processVoiceCommand(transcript);
          };
          
          recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
          };
        }
      } catch (error) {
        console.error("Speech recognition not supported", error);
      }
    };
    
    setupSpeechRecognition();
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [location]);
  
  const startListening = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.start();
        setIsListening(true);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          processVoiceCommand(transcript);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
      }
    } catch (error) {
      console.error("Could not start speech recognition", error);
      toast({
        title: "Voice Control Unavailable",
        description: "Your browser doesn't support voice commands."
      });
    }
  };
  
  const processVoiceCommand = (command: string) => {
    console.log("Voice command received:", command);
    
    if (command.includes("emergency") || command.includes("help")) {
      toast({
        title: "Emergency Mode Activated",
        description: "Initiating emergency call in 5 seconds...",
        variant: "destructive",
        action: (
          <Button onClick={() => toast({ title: "Emergency Call Cancelled" })} variant="outline">
            Cancel
          </Button>
        )
      });
      setTimeout(() => initiateEmergencyCall("108"), 5000);
    } else if (command.includes("home") || command.includes("go home")) {
      location.pathname !== "/" && window.location.assign("/");
    } else if (command.includes("profile") || command.includes("account")) {
      user && window.location.assign("/profile");
    } else if (command.includes("chat") || command.includes("assistant")) {
      window.location.assign("/medical-chat");
    } else if (command.includes("dark mode") || command.includes("light mode")) {
      toggleTheme();
    } else if (command.includes("sign out") || command.includes("logout")) {
      user && handleSignOut();
    } else {
      toast({
        title: "Voice Command Not Recognized",
        description: `I heard: "${command}"`
      });
    }
  };

  // Theme toggle functionality
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  // Define a global style for the pulse animation
  const pulseAnimation = css`
    @keyframes pulse {
      0% {
        stroke-dashoffset: 200;
      }
      50% {
        stroke-dashoffset: 0;
      }
      100% {
        stroke-dashoffset: -200;
      }
    }
  `;

  return (
    <>
      <Global styles={pulseAnimation} />
    <header 
        className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled 
            ? isDarkMode
              ? "bg-gray-900/90 shadow-lg backdrop-blur-xl border-b border-gray-800" 
              : "bg-white/75 shadow-lg backdrop-blur-xl border-b border-purple-100"
            : isDarkMode
              ? "bg-gradient-to-r from-gray-900 via-gray-800/50 to-gray-900/50 border-b border-gray-800"
              : "bg-gradient-to-r from-white via-purple-50/30 to-blue-50/30 border-b border-purple-100/20"
        }`}
      >
        <AnimatePresence>
          {fallDetected && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500 text-white text-center py-2 font-medium flex items-center justify-center"
            >
              <AlertCircle className="h-4 w-4 mr-2 animate-pulse" />
              <span>Fall detected! Emergency services will be contacted unless cancelled.</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4 bg-white/20 hover:bg-white/30 text-white border-white/40"
                onClick={() => setFallDetected(false)}
              >
                I'm OK
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="container py-4 relative">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-bold text-xl md:text-2xl text-gray-900 flex items-center gap-2 group">
              <motion.div 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white relative overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                animate={{ 
                  background: ["linear-gradient(to right, #9333ea, #4f46e5, #3b82f6)", 
                               "linear-gradient(to right, #9333ea, #6366f1, #3b82f6)",
                               "linear-gradient(to right, #9333ea, #4f46e5, #3b82f6)"] 
                }}
                initial={{ background: "linear-gradient(to right, #9333ea, #4f46e5, #3b82f6)" }}
                transition={{
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10,
                  background: { duration: 3, repeat: Infinity }
                }}
              >
                <Heart className="h-5 w-5 stroke-[2.5px] animate-pulse" />
                
                {/* Heartbeat animation */}
                <svg 
                  className="absolute inset-0 w-full h-full" 
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M 10,50 C 20,30 30,30 40,50 L 50,70 L 60,50 C 70,30 80,30 90,50" 
                    stroke="rgba(255,255,255,0.5)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                    style={{
                      animation: "pulse 2s linear infinite"
                    }}
                  />
                </svg>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white/40 rounded-full blur-md transform scale-150 opacity-0 group-hover:opacity-30 transition-all duration-700"></div>
                
                {/* Animated particles */}
                {[...Array(6)].map((_, i) => (
              <motion.span 
                    key={i}
                className="absolute h-1 w-1 bg-white rounded-full"
                    initial={{ opacity: 0.7, x: 0, y: 0 }}
                animate={{ 
                      y: [0, -15 * (1 + i * 0.2), 0], 
                      x: [0, (i % 2 === 0 ? 1 : -1) * 8 * (1 + i * 0.2), 0],
                      opacity: [0.7, 1, 0],
                      scale: [1, 1.5, 0]
                }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2 + i * 0.2, 
                      delay: i * 0.3,
                      ease: "easeInOut" 
                    }}
                    style={{ 
                      left: `${50 + (i % 3) * 5}%`, 
                      top: `${60 - (i % 3) * 10}%`,
                      width: `${2 + (i % 3)}px`,
                      height: `${2 + (i % 3)}px`
                    }}
              />
                ))}
            </motion.div>
              
            <div className="flex flex-col items-start">
              <motion.span 
                  className="font-bold"
                whileHover={{ scale: 1.05 }}
              >
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 animate-gradient-x ${isDarkMode ? 'dark-mode-text' : ''}`}>
                {siteConfig.name}
                  </span>
              </motion.span>
              <motion.span 
                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} flex items-center gap-1 font-normal`}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                  <Sparkles className="h-3 w-3 text-yellow-500 animate-twinkle" />
                <span>AI-Powered Care</span>
              </motion.span>
            </div>
          </Link>

            {/* Health indicators for wearable device data (visible on medium+ screens) */}
            {healthData && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center gap-3 bg-gradient-to-r from-white/80 to-white/50 dark:from-gray-800/80 dark:to-gray-800/50 px-3 py-1.5 rounded-full shadow-sm border border-purple-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-1.5">
                  <Heart className={`h-4 w-4 ${
                    healthData.status === "normal" ? "text-green-500" : 
                    healthData.status === "warning" ? "text-yellow-500" : "text-red-500"
                  } ${healthData.status !== "normal" ? "animate-ping-slow" : ""}`} />
                  <span className={`text-xs font-medium ${
                    healthData.status === "normal" ? "text-green-700 dark:text-green-400" : 
                    healthData.status === "warning" ? "text-yellow-700 dark:text-yellow-400" : "text-red-700 dark:text-red-400"
                  }`}>
                    {healthData.heartRate} bpm
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <Activity className={`h-4 w-4 ${
                    healthData.status === "normal" ? "text-blue-500" : 
                    healthData.status === "warning" ? "text-yellow-500" : "text-red-500"
                  }`} />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                    {healthData.bloodPressure}
                  </span>
                </div>
              </motion.div>
            )}

          <nav className="hidden md:flex items-center space-x-4">
            {mainNav.map((item: NavItem, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`transition-all duration-300 flex items-center gap-1.5 px-3 py-2 rounded-lg ${
                    isActive(item.path) 
                        ? "text-white bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 font-medium shadow-md hover:shadow-lg hover:shadow-purple-200/50" 
                        : `${isDarkMode ? "text-gray-300 hover:text-purple-400 hover:bg-gray-800/80" : "text-gray-700 hover:text-purple-600 hover:bg-purple-50/80"}`
                  }`}
                >
                    <span className="relative">
                  {item.icon}
                  {isActive(item.path) && (
                    <motion.span
                          className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full"
                          animate={{ 
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                    </span>
                    <span>{item.name}</span>
                </Link>
              </motion.div>
            ))}
              <div className="h-6 w-px bg-gradient-to-b from-purple-200 to-blue-200 mx-2 rounded-full"></div>
              
              {/* Theme toggle button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-full p-2 ${isDarkMode ? "bg-gray-800 text-yellow-400" : "bg-purple-100 text-indigo-700"}`}
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
              
              {/* Voice command button */}
              <motion.button
                ref={micRef}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isListening ? { scale: [1, 1.2, 1], borderWidth: 3 } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 1 }}
                className={`rounded-full p-2 relative ${
                  isListening 
                    ? "bg-red-100 text-red-600 border-red-400" 
                    : "bg-blue-100 text-blue-600 border border-blue-300"
                }`}
                onClick={startListening}
                aria-label="Voice commands"
              >
                <Mic className="h-4 w-4" />
                {isListening && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </motion.button>
            
            {!user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                    className={`overflow-hidden relative ${
                      isDarkMode 
                        ? "hover:bg-blue-900 text-blue-400 border border-blue-800 shadow-sm hover:shadow" 
                        : "hover:bg-blue-50 text-blue-600 border border-blue-200 shadow-sm hover:shadow"
                    }`}
                >
                  <Link to="/auth" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                      <span>Sign In</span>
                      <motion.div 
                        className={`absolute inset-0 -z-10 ${isDarkMode ? "bg-blue-800" : "bg-blue-100"}`}
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="sm" className="gap-2 flex items-center group">
                        <Avatar className={`h-8 w-8 ${isDarkMode ? "ring-2 ring-purple-600 group-hover:ring-purple-500" : "ring-2 ring-purple-200 group-hover:ring-purple-400"} transition-all duration-300`}>
                      <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                        <span className={`font-medium text-sm hidden lg:inline-block overflow-hidden relative ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                          {profile?.full_name || "User"}
                          <motion.div 
                            className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                            initial={{ scaleX: 0 }}
                            whileHover={{ scaleX: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </span>
                  </Button>
                    </motion.div>
                </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`animate-in slide-in-from-top-5 zoom-in-95 p-2 ${isDarkMode ? "bg-gray-900 border-gray-700 text-white" : ""}`}>
                    <DropdownMenuLabel className={`font-bold ${isDarkMode ? "text-purple-400" : "text-purple-800"}`}>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDarkMode ? "bg-gray-700" : ""} />
                  <DropdownMenuItem asChild>
                      <Link to="/profile" className={`cursor-pointer w-full flex items-center ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-purple-50"} rounded-md transition-colors`}>
                        <User className="mr-2 h-4 w-4 text-purple-600" />
                        <span className={isDarkMode ? "text-gray-300" : ""}>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link to="/app" className={`cursor-pointer w-full flex items-center ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-purple-50"} rounded-md transition-colors`}>
                        <Upload className="mr-2 h-4 w-4 text-indigo-600" />
                        <span className={isDarkMode ? "text-gray-300" : ""}>My Analyses</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link to="/medical-chat" className={`cursor-pointer w-full flex items-center ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-purple-50"} rounded-md transition-colors`}>
                        <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                        <span className={isDarkMode ? "text-gray-300" : ""}>Medical Chat</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link to="/medical-info" className={`cursor-pointer w-full flex items-center ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-purple-50"} rounded-md transition-colors`}>
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                        <span className={isDarkMode ? "text-gray-300" : ""}>Medical Information</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className={`cursor-pointer text-red-600 hover:bg-red-50 ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-red-50"} rounded-md transition-colors`}>
                    <LogOut className="mr-2 h-4 w-4" />
                      <span className={isDarkMode ? "text-gray-300" : ""}>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="destructive"
                size="sm"
                className="ml-2 animate-pulse-emergency bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg border border-red-400"
                onClick={() => initiateEmergencyCall("108")}
              >
                <div className="flex items-center gap-1.5 relative overflow-hidden group">
                  <div className="absolute -left-8 w-6 h-6 rounded-full bg-red-500 opacity-20 animate-ping"></div>
                  <PhoneCall className="h-4 w-4 text-red-500" />
                  <span>Emergency (108)</span>
                </div>
              </Button>
            </motion.div>
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-3/4 md:w-2/5 bg-gradient-to-br from-white to-purple-50">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white relative overflow-hidden">
                    <Heart className="h-4 w-4 stroke-[2.5px]" />
                    <span className="absolute inset-0 rounded-full bg-white opacity-30 scale-0 animate-ping-slow"></span>
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                    {siteConfig.name}
                  </span>
                </SheetTitle>
                <SheetDescription className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  {siteConfig.description}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6">
                {user && (
                  <div className="mb-4 pb-4 border-b flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile?.full_name || "User"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <nav className="flex flex-col space-y-3">
                  {mainNav.map((item: NavItem, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
                          isActive(item.path) 
                            ? "text-white bg-gradient-to-r from-purple-600 to-blue-500 font-medium shadow-md" 
                            : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {user ? (
                    <>
                      {/* Add this block to display admin link if the user is an admin */}
                      {isAdmin && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start hover:bg-purple-50 text-purple-600 border border-purple-200 mb-2"
                          >
                            <Link to="/admin" className="flex items-center gap-1.5">
                              <Shield className="h-4 w-4" />
                              Admin Panel
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start hover:bg-blue-50 text-blue-600 border border-blue-200 mt-4"
                        >
                          <Link to="/profile" className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            My Profile
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                      >
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start hover:bg-red-50 text-red-600 border border-red-200 mb-2"
                        >
                          <Link to="/medical-info" className="flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" />
                            Medical Information
                          </Link>
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start mt-1 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-blue-50 text-blue-600 border border-blue-200 mt-4"
                      >
                        <Link to="/auth" className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          Sign In
                        </Link>
                      </Button>
                    </motion.div>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
