// app/lib/openaiApi.js

export const generateChatResponse = async (messages) => {
   try {
     const response = await fetch('/api/chat', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ messages }),
     });
     
     if (!response.ok) {
       const errorData = await response.json();
       console.error('API error:', errorData);
       
       if (response.status === 429) {
         return "I'm currently experiencing high demand. Please try again in a moment.";
       }
       
       throw new Error(errorData.error || 'API request failed');
     }
     
     const data = await response.json();
     return data.response;
   } catch (error) {
     console.error('Error generating chat response:', error);
     return "I'm having trouble connecting right now. Please try again in a moment.";
   }
 };