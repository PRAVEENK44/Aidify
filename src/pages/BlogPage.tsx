
import React, { useState, useEffect } from "react";
import { Calendar, Clock, ChevronRight, Search, Tag, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blogPosts } from "@/data/blogPosts";
import { motion } from "framer-motion";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  
  const filteredPosts = blogPosts.filter(post => {
    return (
      (selectedCategory === "All" || post.category === selectedCategory) &&
      (post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
       post.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  const featuredPosts = blogPosts.filter(post => post.featured);
  
  // Extract unique categories
  const categories = ["All", ...Array.from(new Set(blogPosts.map(post => post.category)))];

  const handlePostClick = (id: number) => {
    navigate(`/blog/${id}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-purple-50">
      <main className="flex-1">
        <div className="py-16 bg-gradient-to-r from-purple-600 to-blue-500 relative overflow-hidden">
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
          
          <div className="container px-4 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="px-3 py-1 text-sm bg-white/20 text-white mb-4">
                Resources & Insights
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
                Aidify Blog
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Expert insights, tips, and resources for first aid and health guidance.
              </p>
              
              <motion.div 
                className="mt-8 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="flex gap-3">
                  <Input 
                    placeholder="Search articles..." 
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-offset-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button className="bg-white hover:bg-white/90 text-purple-600">
                    <Search className="h-4 w-4 mr-2" /> Search
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        <div className="container px-4 py-16">
          {/* Featured posts slider */}
          {featuredPosts.length > 0 && (
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
                <Link to="#" className="text-purple-600 hover:underline flex items-center">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    className="group cursor-pointer"
                    onClick={() => handlePostClick(post.id)}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-none">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {post.date}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 transition-colors group-hover:text-purple-600">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{post.author}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Category tabs */}
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="mb-8"
          >
            <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto">
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                >
                  <TabsTrigger 
                    value={category}
                    className="px-4 py-2 border data-[state=active]:border-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </Tabs>
          
          {filteredPosts.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <p className="text-gray-500 text-lg">No articles found matching your search criteria.</p>
              <Button 
                onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
                variant="link" 
                className="mt-2 text-purple-600"
              >
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article 
                  key={post.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col hover:shadow-md transition-all duration-300 transform cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (index % 6) * 0.1, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <Badge className="text-xs font-medium px-3 py-1 bg-purple-50 text-purple-600 border-none">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {post.tags && post.tags.slice(0, 3).map((tag) => (
                          <div key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                            <Tag className="h-3 w-3" /> {tag}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <motion.button 
                        className="flex items-center justify-center gap-1 mt-2 text-purple-600 font-medium hover:text-purple-700 transition-colors w-full group"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Read full article
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
          
          {/* Email subscription */}
          <motion.div 
            className="mt-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute w-64 h-64 -top-32 -right-32 bg-white/10 rounded-full blur-xl"
                animate={{
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div 
                className="absolute w-64 h-64 -bottom-32 -left-32 bg-white/10 rounded-full blur-xl"
                animate={{
                  x: [0, -20, 0],
                  y: [0, 20, 0],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-white/80 mb-6">
                Get the latest health information, emergency response tips, and exclusive content delivered straight to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-offset-purple-500"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="bg-white hover:bg-white/90 text-purple-600">
                    Subscribe Now
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
