import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import AboutPage from "./pages/About";
import BlogPage from "./pages/BlogPage";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import MedicalChatPage from "./pages/MedicalChat";
import InjuryAnalysisPage from "./components/InjuryAnalysisPage";
import FloatingChatButton from "./components/FloatingChatButton";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";
import BlogArticle from "./components/blog/BlogArticle";
import { AuthProvider } from "./context/AuthContext";
import UserProfilePage from "./pages/UserProfilePage";
import EmergencyButton from "@/components/EmergencyButton";
import MedicalInfoPage from "@/pages/MedicalInfoPage";
import AdminPage from "@/pages/AdminPage";

// Configure the query client with better error handling and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime in v4)
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton richColors />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col relative overflow-x-hidden">
              {/* Background decorative elements */}
              <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] -top-300 -right-300 bg-blue-100/30 rounded-full blur-3xl"></div>
                <div className="absolute w-[500px] h-[500px] top-[40%] left-[30%] bg-teal-100/20 rounded-full blur-3xl"></div>
                <div className="absolute w-[400px] h-[400px] -bottom-200 -left-200 bg-cyan-50/30 rounded-full blur-3xl"></div>
              </div>
              
              {/* Medical-themed pattern */}
              <div className="medical-bg-pattern"></div>
              
              <Navbar />
              <main className="flex-1 relative z-10">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/app" element={<AppPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:id" element={<BlogArticle />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/medical-chat" element={<MedicalChatPage />} />
                  <Route path="/medical-assistant" element={<MedicalChatPage />} />
                  <Route path="/injury-analysis" element={<InjuryAnalysisPage />} />
                  <Route path="/medical-info" element={<MedicalInfoPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <FloatingChatButton />
              <EmergencyButton />
              {/* The Footer will be rendered by each page as needed */}
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
