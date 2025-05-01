import React, { useState, FormEvent, useEffect, useRef } from "react";
import { Footer } from "@/components/Footer";
import { MapPin, Mail, Phone, MessageSquare, Send, Clock, Star, ThumbsUp, ThumbsDown, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { initiateEmergencyCall } from '@/utils/deviceUtils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { submitFeedback } from "@/services/feedbackService";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Declare Google Maps types
declare global {
  interface Window {
    initMap: () => void;
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        InfoWindow: new (options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        SymbolPath: {
          CIRCLE: number;
        };
        DirectionsService: new () => any;
        DirectionsRenderer: new (options: any) => any;
        TravelMode: {
          DRIVING: string;
        };
        geometry: {
          spherical: {
            computeDistanceBetween: (from: any, to: any) => number;
          };
        };
      };
    };
  }
}

// Add GoogleMap component section
const GoogleMapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  
  // Office locations
  const officeLocations = [
    {
      name: "Headquarters",
      location: { lat: 12.971588, lng: 77.594030 }, // Bangalore
      address: "42 Residency Road, Bangalore"
    }
  ];
  
  useEffect(() => {
    // Load Google Maps API
    const loadGoogleMapsApi = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBcPQh76Xyl_PRRMbjxuROiEYlES5vQXFg&libraries=geometry,places,directions&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      window.initMap = () => {
        setMapLoaded(true);
      };
    };
    
    loadGoogleMapsApi();
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermissionDenied(true);
        }
      );
    }
  }, []);
  
  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google) {
      // Default to Bangalore headquarters if user location not available
      const center = userLocation || officeLocations[0].location;
      
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: userLocation ? 10 : 6,
        center: center,
      });
      
      // Add markers for office locations
      officeLocations.forEach(office => {
        const marker = new window.google.maps.Marker({
          position: office.location,
          map: map,
          title: office.name,
          label: {
            text: office.name === "Headquarters" ? "HQ" : "RO",
            color: "white"
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#7c3aed",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 10
          }
        });
        
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>${office.name}</strong><br>${office.address}</div>`
        });
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
      
      // Add marker for user's location if available
      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeWeight: 0,
            scale: 8
          }
        });
        
        const userInfoWindow = new window.google.maps.InfoWindow({
          content: "<div><strong>Your Current Location</strong></div>"
        });
        
        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });
        
        // Draw route from user location to nearest office
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3b82f6',
            strokeWeight: 5
          }
        });
        
        // Find nearest office
        const distances = officeLocations.map(office => {
          return {
            office: office,
            distance: window.google.maps.geometry?.spherical?.computeDistanceBetween?.(
              new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
              new window.google.maps.LatLng(office.location.lat, office.location.lng)
            ) || 0
          };
        });
        
        const nearestOffice = distances.reduce((prev, curr) => {
          return prev.distance < curr.distance ? prev : curr;
        });
        
        // Draw route
        directionsService.route({
          origin: userLocation,
          destination: nearestOffice.office.location,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (response, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(response);
          }
        });
      }
    }
  }, [mapLoaded, userLocation]);
  
  if (locationPermissionDenied) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg mb-4">
        <p className="text-yellow-700">Location permission denied. Enable location services to see your distance to our offices.</p>
      </div>
    );
  }
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '450px', borderRadius: '0.5rem' }}>
      {!mapLoaded && (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default function ContactPage() {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState("general");
  const [rating, setRating] = useState(0);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showFeedbackThankYou, setShowFeedbackThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  
  const handleFeedbackSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackError(null);
    
    if (rating === 0) {
      setFeedbackError("Please select a rating before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare feedback data
      const feedback = {
        feedback_type: feedbackType,
        rating,
        details: feedbackDetails || null,
        name: name || null,
        email: email || null
      };
      
      // Submit feedback to database with timeout handling
      const submissionPromise = submitFeedback(feedback, user?.id);
      const timeoutPromise = new Promise<{ success: false, error: string }>((resolve) => {
        setTimeout(() => resolve({ 
          success: false, 
          error: "Submission is taking longer than expected. Please try again." 
        }), 8000);
      });
      
      const result = await Promise.race([submissionPromise, timeoutPromise]);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to submit feedback");
      }
      
      // Reset form and show thank you message
      setFeedbackDetails("");
      setRating(0);
      setName("");
      setEmail("");
      setShowFeedbackThankYou(true);
      setTimeout(() => setShowFeedbackThankYou(false), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-blue-500 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <motion.div 
            className="absolute w-96 h-96 -top-48 -left-48 bg-white/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div 
            className="absolute w-96 h-96 -bottom-48 -right-48 bg-white/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity }}
          />
        </div>
        
        <div className="container px-4 text-center text-white relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Our team is ready to assist you with any questions about first aid, medical emergencies, or how to use Aidify effectively.
          </p>
        </div>
      </div>

      <div className="container px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-lg text-white">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Our Locations</h3>
                    <p className="text-gray-600 font-medium">Headquarters:</p>
                    <p className="text-gray-600">42 Residency Road</p>
                    <p className="text-gray-600">Bangalore, Karnataka 560025</p>
                    <p className="text-gray-600">India</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-lg text-white">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email Us</h3>
                    <p className="text-gray-600">support@aidify.com</p>
                    <p className="text-gray-600">info@aidify.com</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-lg text-white">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Call Us</h3>
                    <p className="text-gray-600">+91 80 4567 8901</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-lg text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Working Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 rounded-lg text-white">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Live Chat Support</h3>
                    <p className="text-gray-600">Available 24/7 through our website</p>
                    <Button variant="link" className="p-0 h-auto text-purple-600">
                      Start Chat
                    </Button>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                className="mt-12 border rounded-xl p-6 bg-purple-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
                <p className="text-gray-600 mb-4">
                  For medical emergencies, please call emergency services immediately.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => initiateEmergencyCall("108")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    General Emergency (108)
                  </div>
                </Button>
              </motion.div>
            </div>
            
            <div className="lg:col-span-2">
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <Input 
                        id="name" 
                        placeholder="John Doe" 
                        className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help you?" 
                      className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Write your message here..." 
                      className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      rows={6}
                    />
                  </div>
                  
                  <div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </motion.div>
              
              {/* Customer Feedback Section */}
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  <div className="flex items-center">
                    <ThumbsUp className="h-6 w-6 mr-2 text-purple-600" />
                    Share Your Feedback
                  </div>
                </h2>
                
                {showFeedbackThankYou ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800 mb-2">Thank You for Your Feedback!</h3>
                    <p className="text-green-700">Your feedback helps us improve our services for everyone.</p>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleFeedbackSubmit}>
                    {feedbackError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{feedbackError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Type
                      </label>
                      <RadioGroup 
                        defaultValue="general" 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        onValueChange={setFeedbackType}
                        value={feedbackType}
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                          <RadioGroupItem value="general" id="general" />
                          <Label htmlFor="general">General Feedback</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                          <RadioGroupItem value="app" id="app" />
                          <Label htmlFor="app">App Experience</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                          <RadioGroupItem value="support" id="support" />
                          <Label htmlFor="support">Support Quality</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Your Experience
                      </label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingChange(value)}
                            className={`p-2 rounded-full transition-all ${
                              rating >= value 
                              ? 'text-yellow-500 scale-110' 
                              : 'text-gray-300 hover:text-yellow-500 hover:scale-110'
                            }`}
                          >
                            <Star className="h-8 w-8 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {!user && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="feedbackName" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name (Optional)
                          </label>
                          <Input 
                            id="feedbackName" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe" 
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label htmlFor="feedbackEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Email (Optional)
                          </label>
                          <Input 
                            id="feedbackEmail" 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com" 
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="feedbackDetails" className="block text-sm font-medium text-gray-700 mb-1">
                        Tell Us More (Optional)
                      </label>
                      <Textarea 
                        id="feedbackDetails" 
                        placeholder="What did you like or what could we improve?" 
                        className="w-full"
                        rows={4}
                        value={feedbackDetails}
                        onChange={(e) => setFeedbackDetails(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          type="submit" 
                          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Feedback"
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                )}
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="p-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                  <h3 className="text-xl font-bold">Visit Our Locations</h3>
                  <p className="text-white/80">Find us at our offices across India</p>
                </div>
                
                {/* Replace iframe with GoogleMapComponent */}
                <GoogleMapComponent />
                
                <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Bangalore HQ:</span> 42 Residency Road
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open("https://maps.google.com/maps?q=Aidify+Headquarters", "_blank")}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="mt-16 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8">
              Can't find the answer you're looking for? Please reach out to our customer support team.
            </p>
            
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
              <div className="px-6 py-4 text-left">
                <h3 className="font-medium text-gray-900">How do I access my Aidify account?</h3>
                <p className="mt-2 text-gray-600">
                  You can access your account by clicking the "Sign In" button in the top right corner of the page.
                </p>
              </div>
              <div className="px-6 py-4 text-left">
                <h3 className="font-medium text-gray-900">Is my medical data secure?</h3>
                <p className="mt-2 text-gray-600">
                  Yes, all data is encrypted and stored securely. We comply with India's Information Technology Act and never share your information with third parties.
                </p>
              </div>
              <div className="px-6 py-4 text-left">
                <h3 className="font-medium text-gray-900">Can I use Aidify on mobile devices?</h3>
                <p className="mt-2 text-gray-600">
                  Yes, Aidify is fully optimized for mobile use. You can access it through your mobile browser or download our app from the App Store or Google Play.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
