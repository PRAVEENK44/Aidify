
import React from "react";
import { CircleCheck, Rocket, Shield, Heart, Brain, Leaf, Upload, Users, Sparkles, Zap, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 py-20 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <motion.div 
              className="absolute w-96 h-96 -top-48 -right-48 bg-blue-200/50 rounded-full blur-3xl"
              animate={{ 
                y: [0, -20, 0], 
                x: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            <motion.div 
              className="absolute w-96 h-96 -bottom-48 -left-48 bg-purple-200/30 rounded-full blur-3xl"
              animate={{ 
                y: [0, 20, 0], 
                x: [0, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            
            {/* Floating particles */}
            <motion.div 
              className="absolute top-1/4 left-1/4 h-2 w-2 bg-purple-400/70 rounded-full"
              animate={{ 
                y: [0, -50, 0], 
                x: [0, 30, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute top-1/3 right-1/4 h-3 w-3 bg-blue-400/70 rounded-full"
              animate={{ 
                y: [0, -70, 0], 
                x: [0, -20, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/3 h-1 w-1 bg-indigo-400/70 rounded-full"
              animate={{ 
                y: [0, 40, 0], 
                x: [0, -15, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.div 
            className="container px-4 relative z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              variants={itemVariants}
            >
              <motion.span 
                className="inline-block"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Heart className="h-16 w-16 text-pink-500 mx-auto mb-6 drop-shadow-lg" />
              </motion.span>
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
                variants={itemVariants}
              >
                About Aidify
              </motion.h1>
              <motion.p 
                className="text-xl text-gray-700" 
                variants={itemVariants}
              >
                Our mission is to leverage AI technology to provide immediate first aid guidance when medical professionals aren't immediately available.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          className="container px-4 py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center mb-8 relative">
                <div className="absolute left-0 h-1 w-16 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mx-4 text-center relative inline-block">
                  Our Mission
                  <motion.span 
                    className="absolute -top-1 -right-6 text-purple-500"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.span>
                </h2>
                <div className="absolute right-0 h-1 w-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
              </div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 relative overflow-hidden"
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-purple-100 to-blue-100 rounded-full transform translate-x-20 -translate-y-20 opacity-30"></div>
                
                <p className="text-gray-700 mb-6 text-lg relative z-10">
                  Aidify was born from a simple yet powerful idea: what if anyone could access reliable first aid guidance in seconds, particularly in remote areas or situations where professional help is minutes or hours away?
                </p>
                <p className="text-gray-700 mb-6 text-lg relative z-10">
                  Our mission is to democratize emergency medical knowledge using artificial intelligence, making critical first aid information accessible to everyone, anywhere, at any time.
                </p>
                <p className="text-gray-700 text-lg relative z-10">
                  We believe that by combining cutting-edge AI technology with trusted medical knowledge, we can help people provide better immediate care during those crucial minutes while waiting for professional medical assistance.
                </p>
                
                <motion.div 
                  className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <motion.div 
                    className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-blue-50 transition-colors group relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-md group-hover:shadow-blue-200/50 transition-all duration-300 relative">
                      <CircleCheck className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping-slow opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-blue-900">Accessible</h3>
                    <p className="text-blue-700/80">Available to everyone, everywhere, at any time</p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-green-50 transition-colors group relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-green-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-md group-hover:shadow-green-200/50 transition-all duration-300 relative">
                      <Zap className="h-8 w-8 text-green-600 group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping-slow opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-green-900">Immediate</h3>
                    <p className="text-green-700/80">Instant guidance when seconds count</p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-red-50 transition-colors group relative overflow-hidden"
                    variants={itemVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-red-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 shadow-md group-hover:shadow-red-200/50 transition-all duration-300 relative">
                      <BadgeCheck className="h-8 w-8 text-red-600 group-hover:scale-110 transition-all duration-300" />
                      <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping-slow opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900">Reliable</h3>
                    <p className="text-red-700/80">Based on trusted medical protocols</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.section>
            
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center mb-8 relative">
                <div className="absolute left-0 h-1 w-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mx-4 text-center relative inline-block">
                  The Technology
                  <motion.span 
                    className="absolute -top-1 -right-6 text-indigo-500"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="h-5 w-5" />
                  </motion.span>
                </h2>
                <div className="absolute right-0 h-1 w-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
              </div>
              
              <motion.div 
                className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden"
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Decorative tech elements */}
                <div className="absolute -top-16 -right-16 w-32 h-32 border-2 border-white/10 rounded-full"></div>
                <div className="absolute top-20 -right-20 w-40 h-40 border border-white/10 rounded-full"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-white/10 rounded-full"></div>
                <div className="absolute top-1/4 right-1/4 h-1 w-20 bg-white/20 rounded-full rotate-45"></div>
                <div className="absolute bottom-1/3 left-1/3 h-1 w-32 bg-white/10 rounded-full -rotate-45"></div>
                
                <p className="mb-8 text-lg relative z-10">
                  Aidify uses a technology called RAG (Retrieval Augmented Generation) combined with advanced image recognition to provide tailored first aid guidance:
                </p>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 group"
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300">
                      <Upload className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-100">Image Recognition</h3>
                    <p className="text-white/90">
                      Our computer vision models are trained to identify various types of injuries from photos with high accuracy.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 group"
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300">
                      <Brain className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-100">Retrieval System</h3>
                    <p className="text-white/90">
                      Once an injury is identified, our system searches a vast database of medical knowledge to find relevant first aid procedures.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 group"
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300">
                      <Leaf className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-100">Information Generation</h3>
                    <p className="text-white/90">
                      The AI generates clear, step-by-step instructions specific to the identified injury using our advanced language models.
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20 group"
                    variants={itemVariants}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300">
                      <Users className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-blue-100">Continuous Learning</h3>
                    <p className="text-white/90">
                      Our system continuously improves through feedback from medical professionals and real-world usage data.
                    </p>
                  </motion.div>
                </motion.div>
                
                <p className="mt-8 text-white/80">
                  All data is processed with strict privacy measures, and the platform is designed to work quickly even with limited internet connectivity.
                </p>
                
                <motion.div 
                  className="mt-10 flex justify-center"
                  whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Button 
                    asChild
                    size="lg" 
                    className="bg-white hover:bg-white/90 text-blue-900 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <Link to="/app">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/30 to-indigo-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10 flex items-center">
                        Try the Technology
                        <motion.span 
                          className="ml-2"
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Rocket className="h-5 w-5" />
                        </motion.span>
                      </span>
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.section>
            
            <motion.section 
              className="mb-16"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex items-center justify-center mb-8 relative">
                <div className="absolute left-0 h-1 w-16 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"></div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mx-4 text-center relative inline-block">
                  Medical Disclaimer
                  <motion.span 
                    className="absolute -top-1 -right-6 text-amber-500"
                    animate={{ rotate: [0, 20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="h-5 w-5" />
                  </motion.span>
                </h2>
                <div className="absolute right-0 h-1 w-16 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"></div>
              </div>
              
              <motion.div 
                className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-amber-900 relative overflow-hidden"
                whileHover={{ 
                  boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.1), 0 10px 10px -5px rgba(245, 158, 11, 0.04)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-amber-100 to-transparent rounded-full transform translate-x-20 -translate-y-20"></div>
                
                <motion.div 
                  className="rounded-full w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-6"
                  whileInView={{ rotateY: [0, 360] }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  viewport={{ once: true }}
                >
                  <Shield className="h-8 w-8 text-amber-600" />
                </motion.div>
                
                <p className="text-xl font-semibold mb-4 text-center">
                  Aidify is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
                <p className="mb-4 text-amber-800">
                  The information provided by Aidify is for informational and educational purposes only. It is designed to support, not replace, the relationship that exists between a patient and their physician.
                </p>
                <p className="text-amber-800">
                  In case of a medical emergency, please call your local emergency services immediately. Do not delay seeking professional medical advice because of something you have read on this website.
                </p>
              </motion.div>
            </motion.section>
            
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="flex flex-col md:flex-row justify-center gap-6 mt-12">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    asChild
                    variant="outline"
                    className="border-purple-500 text-purple-500 hover:bg-purple-50 relative overflow-hidden group"
                  >
                    <Link to="/contact">
                      <span className="absolute inset-0 w-full h-full bg-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                      <span className="relative z-10">Contact Us</span>
                    </Link>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 relative overflow-hidden group"
                  >
                    <Link to="/app">
                      <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10">Try Aidify</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
}
