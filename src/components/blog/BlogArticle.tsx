
import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogPosts";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Sample article images to use when not provided
const articleImages = {
  medicalProfessional: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
  firstAidKit: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
  emergency: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
  technology: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
  children: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
  remoteArea: "https://images.unsplash.com/photo-1518770660439-4636190af475",
};

export default function BlogArticle() {
  const { id } = useParams();
  const articleId = parseInt(id || "0", 10);
  
  // Find the blog post with the matching ID
  const article = blogPosts.find(post => post.id === articleId);
  
  if (!article) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
        <p className="text-gray-600 mb-6">Sorry, the article you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  // Get a relevant image based on article category
  const getRelevantImage = (category: string) => {
    switch (category?.toLowerCase()) {
      case "emergency response":
        return articleImages.emergency;
      case "first aid basics":
        return articleImages.firstAidKit;
      case "technology":
        return articleImages.technology;
      case "pediatric care":
        return articleImages.children;
      case "wilderness medicine":
        return articleImages.remoteArea;
      default:
        return articleImages.medicalProfessional;
    }
  };

  // Sample additional images for article content
  const additionalImage = article?.category ? getRelevantImage(article.category) : articleImages.medicalProfessional;

  // Sample content for the blog post
  const content = article?.content || `
  <p class="lead">
    ${article?.excerpt}
  </p>
  
  <h2>Understanding the Importance</h2>
  <p>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
  </p>
  
  <p>
    Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet.
  </p>
  
  <figure>
    <img src="${article?.image}" class="rounded-lg" alt="${article?.title}" />
    <figcaption class="text-sm text-gray-500 mt-2 text-center">Image: ${article?.title}</figcaption>
  </figure>
  
  <h2>Key Points to Remember</h2>
  <ul>
    <li>Always prioritize safety when dealing with medical emergencies</li>
    <li>Seek professional medical advice for serious conditions</li>
    <li>Keep a well-stocked first aid kit accessible in your home</li>
    <li>Learn basic CPR and first aid techniques before emergencies happen</li>
  </ul>
  
  <figure>
    <img src="${additionalImage}" class="rounded-lg mt-6 mb-6" alt="Additional information" />
    <figcaption class="text-sm text-gray-500 mt-2 text-center">Image: Additional care information</figcaption>
  </figure>
  
  <h2>When to Seek Medical Help</h2>
  <p>
    Donec sed odio dui. Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
  </p>
  
  <blockquote>
    In emergency situations, it's better to err on the side of caution. When in doubt, call emergency services or visit your nearest emergency department.
  </blockquote>
  
  <h2>Conclusion</h2>
  <p>
    Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum. Donec id elit non mi porta gravida at eget metus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
  </p>
  `;

  // Generate related articles (excluding the current one)
  const relatedArticles = blogPosts
    .filter(post => post.id !== articleId)
    .filter(post => post.tags?.some(tag => article?.tags?.includes(tag)))
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 min-h-screen py-12">
      <div className="container px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back button */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              variant="ghost" 
              asChild 
              className="mb-6 flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </motion.div>
          
          {/* Article header */}
          <motion.div 
            className="mb-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Badge className="mb-4 bg-purple-100 hover:bg-purple-200 text-purple-800 border-none">
              {article.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{article.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{article.readTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span className="text-sm">{article.author}</span>
              </div>
            </div>
            
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl shadow-lg mb-6">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          </motion.div>
          
          {/* Article content */}
          <motion.div 
            className="bg-white rounded-xl shadow-md p-8 mb-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-purple-600 prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-md prose-blockquote:italic prose-li:text-gray-600">
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            
            <Separator className="my-8" />
            
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-100">
                  <Tag className="h-3 w-3 mr-1" /> {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Last updated: {article.date}</span>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
            </div>
          </motion.div>
          
          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <motion.div 
              className="mt-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
                  >
                    <Link to={`/blog/${post.id}`} className="block">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                        />
                      </div>
                      <div className="p-4">
                        <Badge className="mb-2 text-xs bg-gray-100 text-gray-800">{post.category}</Badge>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
