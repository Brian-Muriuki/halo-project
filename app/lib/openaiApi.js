// app/lib/openaiApi.js
import { withCsrfStandalone } from '@/app/context/CsrfContext';

// Safe localStorage access helper
const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

export const generateChatResponse = async (messages, userDenomination = 'non-denominational') => {
  try {
    // Add user denomination to help tailor the response
    const userContextMessage = {
      role: 'system',
      content: `The user identifies with the ${userDenomination} Christian tradition. Keep this in mind when referencing Scripture or discussing theology.`
    };
    
    // Include user context as first system message if not already provided
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const messagesWithContext = hasSystemMessage 
      ? messages 
      : [userContextMessage, ...messages];
    
    // Input validation
    if (!Array.isArray(messagesWithContext) || messagesWithContext.length === 0) {
      throw new Error('Invalid messages format');
    }
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withCsrfStandalone({ 
        messages: messagesWithContext,
        userDenomination 
      })),
    });
    
    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 429) {
        return "I'm currently experiencing high demand. Please try again in a moment.";
      }
      
      if (response.status === 400) {
        return "I couldn't process that request. Please try rephrasing your message.";
      }
      
      if (response.status === 500) {
        return "I'm having trouble connecting to my knowledge base. Please try again shortly.";
      }
      
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error || 'API request failed');
    }
    
    const data = await response.json();
    
    // Store conversation in local storage for persistence between sessions
    try {
      if (typeof window !== 'undefined') {
        const storedConversation = JSON.parse(safeLocalStorage.getItem('conversation') || '[]');
        // Only store user messages and AI responses, not system messages
        const userMessages = messages.filter(msg => msg.role !== 'system');
        const updatedConversation = [...storedConversation, ...userMessages, { role: 'assistant', content: data.response }];
        // Keep only last 20 messages to prevent localStorage from getting too large
        const trimmedConversation = updatedConversation.slice(-20);
        safeLocalStorage.setItem('conversation', JSON.stringify(trimmedConversation));
      }
    } catch (storageError) {
      console.warn('Failed to store conversation in localStorage:', storageError);
    }
    
    return data.response;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

// Helper function to load conversation history
export const loadConversationHistory = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const storedConversation = safeLocalStorage.getItem('conversation');
    if (!storedConversation) return [];
    
    const parsedConversation = JSON.parse(storedConversation);
    
    // Convert the OpenAI API message format to our app's message format
    return parsedConversation.map(msg => ({
      text: msg.content,
      sender: msg.role === 'user' ? 'user' : 'ai'
    }));
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return [];
  }
};

// Helper function to clear conversation history
export const clearConversationHistory = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    safeLocalStorage.removeItem('conversation');
    return true;
  } catch (error) {
    console.error('Error clearing conversation history:', error);
    return false;
  }
};