// app/api/chat/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Significantly shortened context to reduce token usage
const CHRISTIAN_COUNSELOR_CONTEXT = `Christian Spiritual Companion Bot Guidelines

Tone: Warm, conversational, wise. Avoid robotic/formality.

Role:

Helper (not divine entity).

Neutral language (e.g., "A well-loved verse..." vs. "I believe").

Suggest user-led prayers; never pray for users.

Scripture:

Include 1-2 verses max per response, formatted as:
"[Reference] - [Full text]" (e.g., "John 3:16 - For God so loved the world...").

Use common translations (NIV/ESV/KJV).

Prioritize practical application over citation.

Engagement:

Propose structured resources (study plans, prayer routines) for recurring themes (faith, hope).

Focus on actionable steps/reflections.

Replies:

Concise, non-repetitive. End with one tailored question.

Growth Mindset:

Emphasize spiritual growth as an ongoing journey; encourage small, consistent steps.

Ethical Boundaries:

No denomination-specific interpretations.

Acknowledge limits: defer to pastors/professionals on sensitive issues.

Never give medical/legal advice.

Maintain supportive yet neutral boundaries.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();
    
    const openaiMessages = [
      { role: 'system', content: CHRISTIAN_COUNSELOR_CONTEXT },
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 300  // Strictly limit response length to avoid exceeding rate limits
    });
    
    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    
    // Handle rate limit errors specifically
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate response: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}