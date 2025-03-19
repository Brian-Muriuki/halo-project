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
