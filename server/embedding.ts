import { Dashboard } from "@shared/schema";

// Simple vector embedding implementation
// In a production environment, you'd use a proper NLP library
export class EmbeddingService {
  // Simple tokenization and stopword removal
  private tokenize(text: string): string[] {
    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'of', 'in', 'to', 'for', 'with', 'by', 'at', 'on', 'from'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopwords.has(word));
  }
  
  // Create a simple vector representation based on word frequency
  public createEmbedding(text: string): number[] {
    // A simple bag-of-words approach
    const tokens = this.tokenize(text);
    const vocabulary = new Set<string>();
    
    // First pass to build vocabulary
    tokens.forEach(token => vocabulary.add(token));
    
    // Convert vocabulary to array for consistent indexing
    const vocabArray = Array.from(vocabulary);
    
    // Initialize vector with zeros
    const vector = new Array(vocabArray.length).fill(0);
    
    // Count word frequencies
    tokens.forEach(token => {
      const index = vocabArray.indexOf(token);
      if (index !== -1) {
        vector[index]++;
      }
    });
    
    // Normalize the vector (L2 normalization)
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return vector.map(val => val / magnitude);
    }
    
    return vector;
  }
  
  // Generate embeddings for dashboard content
  public generateDashboardEmbedding(dashboard: Dashboard): number[] {
    // Combine title and description for better semantic representation
    const content = `${dashboard.title} ${dashboard.description} ${dashboard.category}`;
    return this.createEmbedding(content);
  }
  
  // Calculate cosine similarity between two vectors
  public cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      // Pad the shorter vector with zeros
      const maxLength = Math.max(vecA.length, vecB.length);
      const paddedA = [...vecA, ...new Array(maxLength - vecA.length).fill(0)];
      const paddedB = [...vecB, ...new Array(maxLength - vecB.length).fill(0)];
      
      return this.cosineSimilarity(paddedA, paddedB);
    }
    
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
  
  // Find most similar dashboards based on query
  public findSimilarDashboards(
    query: string,
    dashboards: { id: number; title: string; description: string; embeddings: number[] | null }[],
    limit: number = 5
  ): { dashboardId: number; similarity: number }[] {
    const queryEmbedding = this.createEmbedding(query);
    
    const similarities = dashboards
      .filter(dashboard => dashboard.embeddings !== null)
      .map(dashboard => ({
        dashboardId: dashboard.id,
        similarity: this.cosineSimilarity(queryEmbedding, dashboard.embeddings as number[])
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    return similarities;
  }
}

export const embeddingService = new EmbeddingService();
