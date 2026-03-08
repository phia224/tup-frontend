import axios from "axios";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const generateChatbotResponse = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    return "I apologize, but the AI service is not configured. Please contact our admissions office directly.";
  }

  try {
    const systemMessage: ChatMessage = {
      role: "system",
      content: `You are a helpful admissions assistant for the Technological University of the Philippines (TUP). 
Your role is to assist prospective students with questions about:
- Admission requirements and deadlines
- Programs and courses offered
- Tuition fees and payment options
- Application process and documents needed
- Campus information and facilities
- General university information

Be friendly, professional, and concise. If you don't know specific details, guide them to contact the admissions office. 
Keep responses under 200 words and conversational.`,
    };

    const messages: ChatMessage[] = [
      systemMessage,
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content?.trim();

    if (content) {
      return content;
    }

    return "I apologize, but I could not generate a response. Please try rephrasing your question.";
  } catch (error) {
    console.error("Error generating chatbot response:", error);

    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return "I apologize, but there is an authentication issue with the AI service. Please contact our admissions office directly.";
      }
      if (error.response?.status === 429) {
        return "I apologize, but the service is currently busy. Please try again in a moment or contact our admissions office.";
      }
    }

    return "I apologize, but I encountered an error. Please try again or contact our admissions office for assistance.";
  }
};
