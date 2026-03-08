import { useState } from 'react';
import { generateChatbotResponse } from '../services/openai';

interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm the Technological University of the Philippines admissions assistant. How can I help you today?",
      sender: 'bot',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    'When are the admission deadlines?',
    'How much is the tuition fee?',
    'What are the documents I need to bring?',
  ];

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message.trim();
      setMessage('');
      
      // Add user message
      const userMsg: Message = {
        id: messages.length + 1,
        text: userMessage,
        sender: 'user',
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        // Build conversation history for context
        const conversationHistory = messages
          .slice(1) // Skip the initial greeting
          .map((msg) => ({
            role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: msg.text,
          }));

        // Get AI response
        const botResponse = await generateChatbotResponse(userMessage, conversationHistory);
        
        const botMsg: Message = {
          id: messages.length + 2,
          text: botResponse,
          sender: 'bot',
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error('Error getting chatbot response:', error);
        const errorMsg: Message = {
          id: messages.length + 2,
          text: 'I apologize, but I encountered an error. Please try again or contact our admissions office for assistance.',
          sender: 'bot',
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (isLoading) return;
    
    const userMsg: Message = {
      id: messages.length + 1,
      text: question,
      sender: 'user',
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const conversationHistory = messages
        .slice(1)
        .map((msg) => ({
          role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.text,
        }));

      const botResponse = await generateChatbotResponse(question, conversationHistory);
      
      const botMsg: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      const errorMsg: Message = {
        id: messages.length + 2,
        text: 'I apologize, but I encountered an error. Please try again or contact our admissions office for assistance.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md h-[600px] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 rounded-t-lg flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, #3B0003 0%, #A10008 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                  fill="white"
                />
                <circle cx="7" cy="10" r="1.5" fill="#3B0003" />
                <circle cx="12" cy="10" r="1.5" fill="#3B0003" />
                <circle cx="17" cy="10" r="1.5" fill="#3B0003" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg">Admission Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-4 space-y-4">
          {/* Bot Greeting */}
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(90deg, #3B0003 0%, #A10008 100%)',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                  fill="white"
                />
                <path
                  d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm max-w-[80%]">
              <p className="text-gray-800 text-sm">
                Hello! I'm the Technological University of the Philippines
                admissions assistant. How can I help you today?
              </p>
            </div>
          </div>

          {/* Messages */}
          {messages.slice(1).map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {msg.sender === 'bot' && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(90deg, #3B0003 0%, #A10008 100%)',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                      fill="white"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`rounded-lg p-3 shadow-sm max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    'linear-gradient(90deg, #3B0003 0%, #A10008 100%)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Quick Questions:
              </p>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full text-left bg-white rounded-lg p-3 text-sm text-gray-800 hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your question...."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-shadow border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(90deg, #3B0003 0%, #A10008 100%)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ask about deadlines, fees, requirements, or campus visits
          </p>
        </div>
      </div>
    </div>
  );
}

