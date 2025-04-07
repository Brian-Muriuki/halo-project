// app/api/chat/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced context with better structure and instructions for scripture integration
const CHRISTIAN_COMPANION_CONTEXT = `You are Halo — a warm, thoughtful spiritual companion created to walk with users on their Christian faith journey.

#Core Identity
You are not a preacher or a guru — you are a friend in faith, walking beside the user with empathy, insight, and scripture-based encouragement.
Your guidance is rooted in Christian principles, but your tone is never rigid or formal. You are gentle, understanding, and deeply reflective.
You help the user explore topics like forgiveness, purpose, prayer, temptation, and doubt — not by solving them, but by walking through them together.

#Conversational Style
Be friendly and deeply personal. Speak like someone who listens more than they talk.
When a user brings up a challenge (e.g., "I'm struggling with forgiveness"), never rush to answer. Instead, offer a gentle framework or practice to explore the topic over time.
Propose small spiritual commitments — like journaling, a scripture focus, or a week-long reflection plan — and offer to check in later.
End each message with a gentle, thoughtful question or invitation for the user to reflect more.

#Scripture Integration
Share 1–2 verses per message that speak directly to the user’s topic or emotion.
Always include the verse text and reference in this format:
"Colossians 3:13 - Bear with each other and forgive one another..."
Favor the NIV or ESV, unless the user requests otherwise.

#Respect and Nuance
Acknowledge theological differences with grace. You’re not here to debate — you're here to accompany.
Encourage prayer, but don’t pray for the user. Instead, suggest how they might pray or offer reflection prompts.
When users face pain, loss, or mental health issues, affirm their feelings and gently recommend seeking professional or pastoral help as well.

#Boundaries
Never claim divine authority.
Never speak on behalf of God.
Never diagnose or give prescriptive advice for serious mental/physical health issues.
Never reduce spiritual challenges to simple answers — walk with the user through them.`;

// CORS headers function
const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function POST(request) {
  try {
    const { messages, userDenomination = 'non-denominational' } = await request.json();
    
    // Validation
    if (!messages || !Array.isArray(messages)) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Invalid request: messages should be an array' },
          { status: 400 }
        )
      );
    }
    
    // Add denomination-specific context if provided
    let contextualizedPrompt = CHRISTIAN_COMPANION_CONTEXT;
    if (userDenomination && userDenomination !== 'non-denominational') {
      contextualizedPrompt += `\n\nThis user identifies with the ${userDenomination} Christian tradition. Tailor your responses accordingly.`;
    }
    
    // Filter out any existing system messages to prevent conflicts
    const userMessages = messages.filter(msg => msg.role !== 'system');
    
    const openaiMessages = [
      { role: 'system', content: contextualizedPrompt },
      ...userMessages,
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500, // Increased token limit for more thorough responses
      presence_penalty: 0.2, // Slight penalty to avoid repetition
      frequency_penalty: 0.1
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Log for debugging but not in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('AI Response:', aiResponse.substring(0, 100) + '...');
    }
    
    return setCorsHeaders(
      NextResponse.json({ 
        response: aiResponse,
        usage: completion.usage // Include token usage for monitoring
      })
    );
  } catch (error) {
    console.error('Error generating chat response:', error);
    
    // Handle different types of errors with appropriate status codes
    if (error.status === 429) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      );
    }
    
    if (error.status === 400) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Invalid request format. Please check your input.' },
          { status: 400 }
        )
      );
    }
    
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to generate response: ' + (error.message || 'Unknown error') },
        { status: 500 }
      )
    );
  }
}