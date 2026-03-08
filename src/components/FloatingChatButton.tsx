import { useState } from "react";
import chatLogo from "../assets/chat-log.png";
import ChatbotModal from "./ChatbotModal";

export default function FloatingChatButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="fixed bottom-30 left-20 z-30 w-20 h-20 md:w-20 md:h-20 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        style={{
          background: "linear-gradient(90deg, #3B0003 0%, #A10008 100%)",
        }}
        aria-label="Open chat"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={chatLogo}
          alt="Chat"
          className="w-15 h-15 md:w-35 md:h-35 object-contain"
        />
      </button>

      {/* Chatbot Modal */}
      <ChatbotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
