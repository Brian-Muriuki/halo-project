'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse, loadConversationHistory } from '../lib/openaiApi';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [userDenomination, setUserDenomination] = useState('non-denominational');
  const chatContainerRef = useRef(null);
  
  // This useEffect ensures this component only renders fully on the client
  useEffect(() => {
    setMounted(true);
    
    // Load conversation history from localStorage
    const history = loadConversationHistory();
    if (history.length > 0) {
      setMessages(history);
    }
    
    // Check authentication state
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserDenomination(userData.denomination || 'non-denominational');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the OpenAI API
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add the new user message
      apiMessages.push({ role: 'user', content: input });
      
      const response = await generateChatResponse(apiMessages, userDenomination);

      if (response) {
        const aiMessage = { text: response, sender: 'ai' };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }
    } catch (error) {
      console.error('Error processing chat response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, I'm having trouble responding right now. Please try again later.", sender: 'ai' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Function to render message content with markdown
  const renderMessageContent = (content) => {
    return (
      <ReactMarkdown
        components={{
          // Don't wrap paragraphs in <p> to maintain chat styling
          p: ({ children }) => <>{children}</>,
          // Style links
          a: ({ node, ...props }) => (
            <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          // Style code blocks
          code: ({ node, inline, ...props }) => (
            inline 
              ? <code className="bg-gray-100 px-1 rounded" {...props} />
              : <pre className="bg-gray-100 p-2 rounded overflow-x-auto my-2"><code {...props} /></pre>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Show simple loading state until component is mounted client-side
  if (!mounted) {
    return <div className="chat-container-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">
              <Image 
                src="/globe.svg" 
                alt="Start a conversation" 
                width={40} 
                height={40}
                style={{ 
                  filter: "invert(46%) sepia(82%) saturate(1539%) hue-rotate(210deg) brightness(96%) contrast(96%)" 
                }}
              />
            </div>
            <p>Start a conversation about faith, prayer, or spiritual growth</p>
            <p className="text-sm text-gray-500">Examples: "How can I grow in my prayer life?" or "What does the Bible say about forgiveness?"</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'user' ? 'user' : 'ai'}`}
            >
              {renderMessageContent(message.text)}
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai loading">
            <span>Thinking</span>
            <span className="dot-animation">
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
              <span className="loading-dot"></span>
            </span>
          </div>
        )}
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
          className="resize-none"
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="send-button"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chat;