import { ArrowRight, Shield, MessageSquareText, PhoneCall, Video, Heart, Upload, ShieldCheck, Loader2, CheckCircle, Gauge, Stethoscope, AlertTriangle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { initiateEmergencyCall } from '@/utils/deviceUtils';

const features = [
  {
    icon: <Upload className="h-10 w-10 text-white" />,
    title: "Image Recognition",
    description:
      "Upload images of injuries and our AI will identify the type and severity of the injury.",
  },
  {
    icon: <MessageSquareText className="h-10 w-10 text-white" />,
    title: "Instant First Aid Instructions",
    description:
      "Receive clear, step-by-step first aid instructions tailored to the specific injury detected.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-white" />,
    title: "Emergency Support",
    description:
      "Critical information to help you provide appropriate care while waiting for professional medical help.",
  },
  {
    icon: <PhoneCall className="h-10 w-10 text-white" />,
    title: "Emergency Call",
    description:
      "One-click emergency call feature to directly contact local emergency services when needed.",
  },
  {
    icon: <Video className="h-10 w-10 text-white" />,
    title: "Video Tutorials",
    description:
      "Watch guided first-aid video demonstrations specifically for the detected injury.",
  },
  {
    icon: <Shield className="h-10 w-10 text-white" />,
    title: "Medical Database",
    description:
      "Access to an extensive database of medical conditions and treatment protocols.",
  },
  {
    icon: <Heart className="h-10 w-10 text-white" />,
    title: "AI Health Assistant",
    description:
      "Ask follow-up questions about health concerns and receive personalized guidance.",
  },
  {
    icon: <PhoneCall className="h-10 w-10 text-white" />,
    title: "Telemedicine",
    description:
      "Connect with healthcare professionals via telemedicine for additional guidance.",
  },
];

const Index = () => {
  const { user, isLoading } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      // Get the user's name from metadata
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || null;
      setUserName(name);
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Medical emergency background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-blue-500/40"></div>
        </div>
        
        <div className="container px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {userName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-3"
                >
                  <Badge variant="outline" className="px-3 py-1 border-purple-300 bg-purple-50 text-purple-800">
                    Welcome back, {userName}
                  </Badge>
                </motion.div>
              )}
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  AI-Powered Health Assistant
                </span>{" "}
                <br className="hidden md:block" />
                When Every Second Counts
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.7 }}
              >
                Aidify uses advanced AI to identify health concerns, provide immediate guidance, and connect you with the care you need when you need it most.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white animate-pulse"
                >
                  <Link to="/app">
                    Try Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Link to="/about">Learn More</Link>
                </Button>
                <Button
                  asChild
                  variant="destructive"
                  size="lg"
                  className="animate-pulse bg-red-600 hover:bg-red-700"
                >
                  <a href="tel:108" className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4" />
                    Emergency Call (108)
                  </a>
                </Button>
              </motion.div>
              
              {user && (
                <motion.div 
                  className="mt-6 text-center lg:text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Link 
                    to="/profile" 
                    className="text-purple-600 hover:text-purple-700 underline text-sm font-medium inline-flex items-center"
                  >
                    View your profile <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
            <motion.div 
              className="relative lg:left-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="aspect-video bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 relative shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="First Aid Application Interface"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <p className="font-medium text-lg">Real-time AI assistance for your health</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Heart className="h-12 w-12 text-purple-500" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-full h-20 bg-white"
          style={{ clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0 0)" }}
        ></motion.div>
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Badge className="px-3 py-1 text-sm bg-purple-100 text-purple-800 mb-4">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Aidify Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI platform combines image recognition with medical knowledge to deliver accurate health guidance.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload an Image</h3>
              <p className="text-gray-600">
                Take a photo of the injury or upload an existing image to our secure platform.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI recognizes the injury type and severity using advanced computer vision models.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Guidance</h3>
              <p className="text-gray-600">
                Receive immediate, step-by-step guidance specific to your situation through text, voice, and video.
              </p>
            </motion.div>
          </div>
        </div>
        
        <motion.div 
          className="absolute bottom-0 right-0 w-full h-20 bg-gradient-to-r from-purple-600 to-blue-500"
          style={{ clipPath: "polygon(0 100%, 100% 0%, 100% 100%, 0 100%)" }}
        ></motion.div>
      </section>

      {/* Interactive First Aid Demo Card */}
      <section className="py-16 bg-white relative overflow-hidden">
        <motion.div 
          className="container px-4 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <Badge className="px-3 py-1 text-sm bg-purple-100 text-purple-800 mb-4">Demo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience AI-Powered First Aid
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our system analyzes injuries and provides step-by-step first aid guidance.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 overflow-hidden"
              whileHover={{ 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left side - Image Upload & Analysis Simulation */}
                <div className="p-8 border-r border-purple-100">
                  <h3 className="text-2xl font-semibold mb-4 text-purple-800 flex items-center">
                    <Upload className="h-6 w-6 mr-2 text-purple-600" />
                    Injury Analysis
                  </h3>
                  
                  <div className="mt-6 relative">
                    <img 
                      src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Injury Sample" 
                      className="w-full h-64 object-cover rounded-lg border-4 border-white shadow-md"
                    />
                    
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 1.5, delay: 1 }}
                    >
                      <Loader2 className="h-12 w-12 text-white animate-spin" />
                    </motion.div>
                    
                    <motion.div 
                      className="absolute -right-3 -bottom-3 bg-white rounded-full p-2 shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.5, type: "spring" }}
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </motion.div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <motion.div 
                      className="bg-white p-3 rounded-lg border border-purple-100 flex items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.8 }}
                    >
                      <div className="bg-purple-100 rounded-full p-2 mr-3">
                        <Search className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Detected Injury Type</p>
                        <p className="text-lg font-bold text-purple-900">Minor Cut/Laceration</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-3 rounded-lg border border-purple-100 flex items-center"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3 }}
                    >
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <Gauge className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Severity Assessment</p>
                        <p className="text-lg font-bold text-green-600">Low Severity</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Right side - First Aid Instructions */}
                <div className="bg-gradient-to-br from-white to-blue-50 p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-blue-800 flex items-center">
                    <Stethoscope className="h-6 w-6 mr-2 text-blue-600" />
                    First Aid Instructions
                  </h3>
                  
                  <div className="space-y-4">
                    <motion.div 
                      className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.2 }}
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="font-bold text-blue-700">1</span>
                        </div>
                        <p className="font-medium">Clean the wound with mild soap and water</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.4 }}
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="font-bold text-blue-700">2</span>
                        </div>
                        <p className="font-medium">Apply pressure with a clean cloth to stop bleeding</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.6 }}
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          <span className="font-bold text-blue-700">3</span>
                        </div>
                        <p className="font-medium">Apply antibiotic ointment to prevent infection</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3.8 }}
                    >
                      <div className="flex items-center">
                        <div className="bg-red-100 rounded-full p-1 mr-3">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="font-medium text-red-700">Seek medical attention if the wound is deep or shows signs of infection</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="mt-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4 }}
                  >
                    <Button 
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Link to="/app">
                        Try with Your Own Image
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>This is a demonstration. For real emergencies, please seek immediate medical attention.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-500 text-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=2532&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Medical Background" 
            className="w-full h-full object-cover opacity-20"
          />
          
          <motion.div 
            className="absolute w-96 h-96 -top-48 -left-48 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 30, repeat: Infinity }}
          ></motion.div>
          
          <motion.div 
            className="absolute w-96 h-96 -bottom-48 -right-48 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          ></motion.div>
        </div>
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Badge className="px-3 py-1 text-sm bg-white/20 text-white mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key Features
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Aidify combines advanced technology with medical expertise to provide reliable health guidance.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="backdrop-blur-sm bg-white/10 p-8 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                }}
              >
                <motion.div 
                  className="mb-5"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="opacity-90">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-800 relative">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Emergency Background" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="text-center text-white max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Emergency Assistance
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Need immediate help? Call emergency services directly or try our AI-assisted health guidance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="destructive"
                  className="bg-white text-red-600 hover:bg-gray-100 animate-pulse w-full"
                  onClick={() => initiateEmergencyCall("108")}
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-5 w-5" />
                    Call Emergency (108)
                  </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Link to="/medical-chat" className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Chat with Aidie
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
