
import React from "react";
import MedicalChat from "@/components/MedicalChat";
import { Heart, Shield, AlertTriangle, Brain, Bot, LifeBuoy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function MedicalChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10">
      <div className="container px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="mb-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="mb-4 flex justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Badge variant="outline" className="px-3 py-1 border-purple-500 text-purple-600 bg-purple-50 gap-1 text-sm">
                <Heart className="h-3.5 w-3.5" />
                AI Health Assistant
              </Badge>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 mb-4"
              initial={{ letterSpacing: "0.2em", opacity: 0.5 }}
              animate={{ letterSpacing: "normal", opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Aidify Chat
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your personal AI health assistant for healthcare guidance
            </motion.p>
          </motion.div>
          
          <div className="relative">
            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [-5, 5, -5],
                y: [-5, 5, -5],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-10 -right-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [5, -5, 5],
                y: [5, -5, 5],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            
            <motion.div 
              className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 mb-8 relative z-10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-2"></div>
              <div className="h-[700px]">
                <MedicalChat />
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  About Aidie
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="disclaimer" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Disclaimer
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="animate-fade-in">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">What is Aidie?</h2>
                  <p className="text-gray-600 mb-4">
                    Aidie (AI Digital Interactive Expert) is an AI-powered health assistant designed to provide helpful information about common health concerns, first aid procedures, and general wellness guidance.
                  </p>
                  <p className="text-gray-600">
                    Powered by state-of-the-art AI technology, Aidie can understand your medical questions and provide relevant, evidence-based information to help you make informed decisions about your health.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Brain className="h-10 w-10 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">AI-Powered Responses</h3>
                    <p className="text-gray-600 text-sm">
                      Aidie provides intelligent responses based on medical knowledge and up-to-date information.
                    </p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <LifeBuoy className="h-10 w-10 text-blue-500 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">First Aid Guidance</h3>
                    <p className="text-gray-600 text-sm">
                      Get step-by-step instructions for basic first aid procedures in common emergency situations.
                    </p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <Shield className="h-10 w-10 text-indigo-500 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Privacy Protected</h3>
                    <p className="text-gray-600 text-sm">
                      Your conversations are protected. We prioritize your privacy and data security.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="disclaimer" className="animate-fade-in">
                <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold mb-3 text-amber-800">Medical Disclaimer</h2>
                      <div className="space-y-3 text-amber-800">
                        <p>
                          The information provided by Aidie is for informational and educational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
                        </p>
                        <p>
                          Always seek the advice of your physician or other qualified healthcare provider with any questions you may have regarding a medical condition or treatment.
                        </p>
                        <p className="font-medium">
                          In case of medical emergency, please call your local emergency services immediately. Do not delay seeking professional medical advice because of something you have read on this website.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <motion.div 
            className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200 max-w-3xl mx-auto flex items-center justify-center gap-3 text-gray-600"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Heart className="h-5 w-5 text-purple-500" />
            <p className="text-sm">
              Contact emergency services immediately for serious medical conditions
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
