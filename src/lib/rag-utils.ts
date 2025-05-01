// RAG (Retrieval-Augmented Generation) Utilities
// This file contains functions for implementing RAG with the Gemini API

import { firstAidKnowledgeBase, knowledgeBaseEmbeddings } from './knowledge-base';

/**
 * Simple vector similarity calculation using cosine similarity
 * @param {Array<number>} vec1 - First vector
 * @param {Array<number>} vec2 - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
export function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same dimensions');
  }
  
  // Calculate cosine similarity manually
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  
  // Handle NaN cases (when one of the vectors is all zeros)
  return isNaN(similarity) ? 0 : similarity;
}

/**
 * Generate a simple embedding for a query string
 * This is a simplified version for demonstration purposes
 * In a real implementation, you would use a proper embedding model
 * @param {string} query - The query text
 * @returns {Array<number>} - A vector embedding
 */
export function generateSimpleEmbedding(query: string): number[] {
  // This is a very simplified embedding generation
  // In a real implementation, you would use a proper embedding model
  const keywords: Record<string, number[]> = {
    'cut': [0.2, 0.1, 0.8, 0.3, 0.5, 0.2, 0.1, 0.9, 0.3, 0.4],
    'scrape': [0.2, 0.1, 0.8, 0.3, 0.5, 0.2, 0.1, 0.9, 0.3, 0.4],
    'bleed': [0.9, 0.1, 0.3, 0.2, 0.4, 0.8, 0.1, 0.5, 0.3, 0.2],
    'burn': [0.7, 0.2, 0.3, 0.8, 0.1, 0.9, 0.2, 0.3, 0.1, 0.5],
    'sprain': [0.3, 0.8, 0.2, 0.1, 0.7, 0.3, 0.9, 0.2, 0.4, 0.1],
    'strain': [0.3, 0.8, 0.2, 0.1, 0.7, 0.3, 0.9, 0.2, 0.4, 0.1],
    'choke': [0.1, 0.3, 0.5, 0.2, 0.9, 0.1, 0.4, 0.3, 0.7, 0.2],
    'fracture': [0.2, 0.7, 0.1, 0.5, 0.3, 0.2, 0.8, 0.1, 0.4, 0.6],
    'break': [0.2, 0.7, 0.1, 0.5, 0.3, 0.2, 0.8, 0.1, 0.4, 0.6],
    'heart': [0.5, 0.2, 0.4, 0.1, 0.8, 0.3, 0.2, 0.7, 0.1, 0.9],
    'stroke': [0.4, 0.1, 0.7, 0.3, 0.2, 0.5, 0.1, 0.8, 0.3, 0.6],
    'poison': [0.1, 0.5, 0.3, 0.7, 0.2, 0.4, 0.6, 0.1, 0.8, 0.3],
    'heat': [0.6, 0.3, 0.1, 0.4, 0.2, 0.7, 0.3, 0.5, 0.2, 0.8],
    'knee': [0.35, 0.85, 0.2, 0.15, 0.75, 0.3, 0.95, 0.25, 0.4, 0.15],
    'ankle': [0.32, 0.82, 0.22, 0.12, 0.72, 0.32, 0.92, 0.22, 0.42, 0.12],
    'sport': [0.3, 0.75, 0.25, 0.15, 0.7, 0.35, 0.9, 0.25, 0.45, 0.2],
    'head': [0.25, 0.65, 0.15, 0.45, 0.35, 0.25, 0.75, 0.15, 0.45, 0.55],
    'concussion': [0.25, 0.65, 0.15, 0.45, 0.35, 0.25, 0.75, 0.15, 0.45, 0.55],
    'swelling': [0.3, 0.7, 0.2, 0.15, 0.65, 0.3, 0.85, 0.2, 0.4, 0.2],
    'bruise': [0.4, 0.6, 0.2, 0.3, 0.5, 0.4, 0.7, 0.2, 0.4, 0.3],
    'limping': [0.35, 0.8, 0.2, 0.1, 0.7, 0.35, 0.9, 0.25, 0.4, 0.1],
  };
  
  // Initialize with zeros
  const embedding = Array(10).fill(0);
  let matchCount = 0;
  
  // Simple keyword matching
  const queryLower = query.toLowerCase();
  for (const [keyword, keywordEmbedding] of Object.entries(keywords)) {
    if (queryLower.includes(keyword)) {
      // Add the keyword embedding to our result
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] += keywordEmbedding[i];
      }
      matchCount++;
    }
  }
  
  // Normalize if we had matches
  if (matchCount > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= matchCount;
    }
  } else {
    // Default embedding if no keywords matched
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Math.random() * 0.5; // Random values but lower magnitude
    }
  }
  
  return embedding;
}

/**
 * Extract visual keywords from a query to enhance image analysis
 * @param query - The query text
 * @returns Array of visual keywords extracted from the query
 */
export function extractVisualKeywords(query: string): string[] {
  const visualKeywords = [
    "swelling", "bruising", "red", "purple", "blue", "cut", "wound", "blood",
    "limping", "holding", "protecting", "bandage", "sling", "discoloration", 
    "bent", "twisted", "deformed", "brace", "cast", "wrap", "crutches", 
    "wheelchair", "swollen", "bleeding", "pale", "sweating", "distress",
    "grimace", "pain", "discomfort", "unable to move", "difficulty walking",
    "ankle", "knee", "arm", "leg", "head", "face", "chest", "back", "foot",
    "hand", "finger", "toe", "joint", "bone", "muscle", "skin", "burn", "blister"
  ];
  
  const queryLower = query.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const keyword of visualKeywords) {
    if (queryLower.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}

/**
 * Retrieve the most relevant information from the knowledge base
 * Enhanced to better handle image analysis
 * @param {string} query - The query text
 * @param {number} topK - Number of results to return
 * @returns {Array<Object>} - Array of relevant knowledge base entries
 */
export function retrieveRelevantInformation(query: string, topK: number = 3) {
  // Generate embedding for the query
  const queryEmbedding = generateSimpleEmbedding(query);
  
  // Extract visual keywords to enhance matching
  const visualKeywords = extractVisualKeywords(query);
  
  // Calculate similarity with each knowledge base entry
  const similarities = Object.entries(knowledgeBaseEmbeddings).map(([id, embedding]) => {
    // Start with vector similarity
    let similarity = calculateCosineSimilarity(queryEmbedding, embedding);
    
    // Find the corresponding entry
    const entry = firstAidKnowledgeBase.find(item => item.id === id);
    
    // Boost similarity based on visual indicators matching
    if (entry && entry.visual_indicators && visualKeywords.length > 0) {
      const visualIndicatorsText = entry.visual_indicators.join(' ').toLowerCase();
      
      // Count how many visual keywords match the entry's visual indicators
      let matchCount = 0;
      for (const keyword of visualKeywords) {
        if (visualIndicatorsText.includes(keyword)) {
          matchCount++;
        }
      }
      
      // Boost similarity score based on visual keyword matches (up to 20% boost)
      const visualBoost = Math.min(0.2, matchCount * 0.05);
      similarity += visualBoost;
    }
    
    return { id, similarity };
  });
  
  // Sort by similarity (descending)
  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Get top K results
  const topResults = similarities.slice(0, topK);
  
  // Retrieve the full knowledge base entries
  return topResults.map(result => {
    const entry = firstAidKnowledgeBase.find(item => item.id === result.id);
    return {
      ...entry,
      similarity: result.similarity
    };
  });
}

/**
 * Format retrieved information for inclusion in the prompt
 * @param {Array<Object>} retrievedInfo - Array of retrieved knowledge base entries
 * @returns {string} - Formatted context string
 */
export function formatRetrievedInformation(retrievedInfo: any[]): string {
  if (!retrievedInfo || retrievedInfo.length === 0) {
    return '';
  }
  
  let context = '\n\n### RELEVANT MEDICAL REFERENCE INFORMATION ###\n\n';
  
  retrievedInfo.forEach((info, index) => {
    // Format the title with similarity percentage
    const similarityPercentage = Math.round(info.similarity * 100);
    context += `${index + 1}. ${info.title} (${similarityPercentage}% match):\n`;
    
    // Add the main content
    context += `${info.content}\n\n`;
    
    // Add visual indicators if available (very important for image analysis)
    if (info.visual_indicators && info.visual_indicators.length > 0) {
      context += `VISUAL INDICATORS: ${info.visual_indicators.join(', ')}\n\n`;
    }
    
    // Add symptoms
    if (info.symptoms && info.symptoms.length > 0) {
      context += `SYMPTOMS: ${info.symptoms.join(', ')}\n\n`;
    }
    
    // Add emergency signs
    if (info.emergency_signs && info.emergency_signs.length > 0) {
      context += `EMERGENCY SIGNS: ${info.emergency_signs.join(', ')}\n\n`;
    }
  });
  
  // Add instruction for using the information
  context += 'Use the above medical reference information to assist in accurately identifying the injury in the image and providing appropriate first aid instructions.\n\n';
  
  return context;
} 