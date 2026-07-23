import React from 'react';
import { MessageCircle } from 'lucide-react';
import './FloatingChat.css';

const FloatingChat = () => {
  return (
    <button className="floating-chat animate-fade-in-up delay-300" aria-label="Open chat">
      <MessageCircle size={24} className="chat-icon" />
    </button>
  );
};

export default FloatingChat;
