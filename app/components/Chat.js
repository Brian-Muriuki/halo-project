'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse } from '../lib/openaiApi';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatContainerRef = useRef(null);

  // This useEffect ensures this component only renders fully on the client
  useEffect(() => {
    setMounted(true);
  }, []);

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
      // We'll limit to the last 5 messages to reduce token usage
      const recentMessages = messages.slice(-5).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      recentMessages.push({ role: 'user', content: input });

      // This will now rely on OpenAI to include Bible verses directly
      const response = await generateChatResponse(recentMessages);

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

  // Show simple loading state until component is mounted client-side
  if (!mounted) {
    return <div className="chat-container-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Start a conversation about faith, prayer, or spiritual growth</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === 'user' ? 'user' : 'ai'}`}
            >
              {message.text}
            </div>
          ))
        )}
        {isLoading && (
          <div className="message ai loading">
            <span>Thinking</span>
            <span className="dot-animation">...</span>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chat;