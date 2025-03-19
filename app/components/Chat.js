// app/components/Chat.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse, loadConversationHistory } from '@/app/lib/openaiApi';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from '@/app/styles/chat.module.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputError, setInputError] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const { currentUser, userProfile } = useAuth();
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  
  const MAX_INPUT_LENGTH = 500; // Maximum characters allowed
  
  // This useEffect ensures this component only renders fully on the client
  useEffect(() => {
    setMounted(true);
    
    // Load conversation history from localStorage
    const history = loadConversationHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set height to scrollHeight to fit content
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
    
    // Update character count
    setCharacterCount(input.length);
    
    // Validate input length
    if (input.length > MAX_INPUT_LENGTH) {
      setInputError(`Message is too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`);
    } else {
      setInputError('');
    }
  }, [input]);

  const validateInput = (text) => {
    if (!text || !text.trim()) {
      setInputError('Please enter a message');
      return false;
    }
    
    if (text.length > MAX_INPUT_LENGTH) {
      setInputError(`Message is too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`);
      return false;
    }
    
    // Check for potentially harmful or inappropriate content
    // This is a basic check - you might want to use more sophisticated methods
    const potentiallyHarmfulPatterns = [
      /<script/i,
      /DROP TABLE/i,
      /DELETE FROM/i,
      /;shutdown/i
    ];
    
    for (const pattern of potentiallyHarmfulPatterns) {
      if (pattern.test(text)) {
        setInputError('Your message contains potentially harmful content');
        return false;
      }
    }
    
    setInputError('');
    return true;
  };

  const handleSendMessage = async () => {
    // Don't send if already loading or input is invalid
    if (isLoading || !validateInput(input)) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setCharacterCount(0);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Convert messages to the format expected by the OpenAI API
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add the new user message
      apiMessages.push({ role: 'user', content: input });
      
      // Get user denomination from profile if available
      const userDenomination = userProfile?.denomination || 'non-denominational';
      
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
  
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);
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
    return <div className={styles['chat-container-loading']}>Loading chat...</div>;
  }

  return (
    <div className={styles['chat-container']}>
      <div className={styles['chat-messages']} ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className={styles['empty-chat']}>
            <div className={styles['empty-chat-icon']}>
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
              className={`${styles.message} ${message.sender === 'user' ? styles.user : styles.ai}`}
            >
              {renderMessageContent(message.text)}
            </div>
          ))
        )}
        {isLoading && (
          <div className={`${styles.message} ${styles.ai} ${styles.loading}`}>
            <span>Thinking</span>
            <span className={styles['dot-animation']}>
              <span className={styles['loading-dot']}></span>
              <span className={styles['loading-dot']}></span>
              <span className={styles['loading-dot']}></span>
            </span>
          </div>
        )}
      </div>
      <div className={styles['chat-input']}>
        <div className={styles['textarea-container']}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
            className={`resize-none ${inputError && input ? 'input-error' : ''}`}
            aria-invalid={!!inputError}
            aria-describedby={inputError ? "input-error" : undefined}
            maxLength={MAX_INPUT_LENGTH + 50} // Allow some buffer beyond the limit
          />
          <div className={styles['textarea-footer']}>
            {inputError && input ? (
              <span className="field-error-message" id="input-error" role="alert">
                {inputError}
              </span>
            ) : (
              <span className={`${styles['character-count']} ${characterCount > MAX_INPUT_LENGTH ? styles['text-error'] : ''}`}>
                {characterCount}/{MAX_INPUT_LENGTH}
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim() || !!inputError}
          className={styles['send-button']}
          aria-label="Send message"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chat;