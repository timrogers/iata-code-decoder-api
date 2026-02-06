// Optimized filtering with prefix index for better performance
import { Airport, Airline, Aircraft, Keyable } from './types.js';

// Generic prefix index builder
export class PrefixIndex<T extends Keyable> {
  private index: Map<string, T[]>;
  
  constructor(items: T[], maxPrefixLength: number) {
    this.index = new Map();
    
    for (const item of items) {
      const code = item.iataCode.toLowerCase();
      // Create index entries for all prefixes up to maxPrefixLength
      for (let len = 1; len <= Math.min(code.length, maxPrefixLength); len++) {
        const prefix = code.substring(0, len);
        
        if (!this.index.has(prefix)) {
          this.index.set(prefix, []);
        }
        this.index.get(prefix)!.push(item);
      }
    }
  }
  
  search(query: string, maxLength: number): T[] {
    if (query.length > maxLength) {
      return [];
    }
    return this.index.get(query.toLowerCase()) || [];
  }
  
  getIndexSize(): number {
    return this.index.size;
  }
}

// Alternative: Trie-based search for even more efficient prefix matching
export class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  items: T[];
  
  constructor() {
    this.children = new Map();
    this.items = [];
  }
}

export class PrefixTrie<T extends Keyable> {
  private root: TrieNode<T>;
  
  constructor(items: T[], maxPrefixLength: number) {
    this.root = new TrieNode();
    
    for (const item of items) {
      const code = item.iataCode.toLowerCase();
      let node = this.root;
      
      for (let i = 0; i < Math.min(code.length, maxPrefixLength); i++) {
        const char = code[i];
        
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        
        node = node.children.get(char)!;
        node.items.push(item);
      }
    }
  }
  
  search(query: string, maxLength: number): T[] {
    if (query.length > maxLength) {
      return [];
    }
    
    let node = this.root;
    const lowerQuery = query.toLowerCase();
    
    for (const char of lowerQuery) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }
    
    return node.items;
  }
}
