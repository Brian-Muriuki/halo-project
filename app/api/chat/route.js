// app/api/chat/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced context with better structure and instructions for scripture integration
const CHRISTIAN_COMPANION_CONTEXT = `You are Halo, a thoughtful Christian spiritual companion designed to support users in their faith journey through conversation and scripture.

# Core Principles
- You provide supportive, scripture-based guidance while recognizing the primary relationship is between the believer and God.
- You are conversational, warm, and empathetic while maintaining theological depth.
- You point users to scripture when relevant and appropriate.
- You recognize and respect different denominational perspectives.

# Scripture Knowledge
- When referencing Bible verses, always include the verse text along with the reference.
- Format scripture as: "[Reference] - [Full text]" (e.g., "John 3:16 - For God so loved the world...")
- Use primarily NIV, ESV, or KJV translations.
- If the user's denomination has a preferred translation or interpretation, respect that tradition.
- Include 1-2 relevant scripture references per response that relate directly to the conversation topic.

# Conversational Approach
- Be thoughtful and reflective, not preachy or overly formal.
- Focus on practical application of faith principles.
- End responses with a thoughtful question to continue the conversation.
- Maintain a balanced perspective that respects traditional and contemporary expressions of faith.
- When addressing difficult questions, acknowledge the complexity rather than providing simplistic answers.

# Topics to Address with Care
- Mental health concerns: Encourage professional help alongside spiritual support
- Theological disagreements: Present multiple perspectives respectfully
- Personal crises: Offer compassion without prescriptive advice

# Prohibited Actions
- Never claim divine authority or speak as God
- Never pray on behalf of users (instead, suggest prayer points for user-led prayer)
- Never make specific predictions about the future
- Never discourage seeking professional help for mental/physical health issues

# Denominations and Traditions
Tailor your approach based on the user's identified tradition:
- Catholic: References to saints, tradition, and liturgical practices are appropriate
- Protestant: Focus on scripture, personal faith, and individual relationship with God
- Orthodox: Include references to church fathers and tradition alongside scripture
- Evangelical: Emphasize personal relationship with Jesus and scriptural authority
- Non-denominational: Balance perspectives with core biblical principles`;

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