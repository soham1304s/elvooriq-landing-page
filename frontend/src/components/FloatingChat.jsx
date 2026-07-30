import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';
import './FloatingChat.css';

const QUICK_PROMPTS = [
  "How to become an ELVOORIQ creator?",
  "What are Brand Partnerships?",
  "How does 24/7 Technical Support work?",
  "What are the platform fees & payout terms?"
];

const getAIResponse = (input) => {
  const query = input.toLowerCase();

  if (query.includes('creator') || query.includes('join') || query.includes('apply') || query.includes('register')) {
    return "You can apply to become an ELVOORIQ creator by clicking 'Become a Creator' in the top header or visiting our Register page. Our talent management team reviews applications within 24-48 hours!";
  }
  if (query.includes('brand') || query.includes('sponsor') || query.includes('deal') || query.includes('partner')) {
    return "ELVOORIQ Brand Marketplace connects verified creators directly with global tech, gaming, beauty, and lifestyle brands. We handle contracts, campaign deliverables, and guaranteed escrow payouts.";
  }
  if (query.includes('stream') || query.includes('live') || query.includes('obs') || query.includes('latency')) {
    return "Our Live Streaming engine features sub-second RTMP broadcasting, multi-streaming to YouTube/Twitch/Kick, AI chat moderation shields, and automatic 1080p60 cloud DVR recording.";
  }
  if (query.includes('analytic') || query.includes('data') || query.includes('metric') || query.includes('revenue')) {
    return "ELVOORIQ Analytics provides real-time audience peak tracking, viewer retention heatmaps, cross-platform benchmarking, and multi-stream revenue dashboards.";
  }
  if (query.includes('support') || query.includes('tech') || query.includes('help') || query.includes('setup')) {
    return "Our 24/7 Technical Support team offers live stream emergency helpdesk, OBS scene configuration, hardware audio tuning, and redundant backup stream ingests.";
  }
  if (query.includes('fee') || query.includes('cost') || query.includes('price') || query.includes('free')) {
    return "Joining ELVOORIQ as a creator is 100% free! We only partner on transparent revenue share models for high-value brand sponsorships and talent management.";
  }
  if (query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('location')) {
    return "You can contact our global team anytime via support@elvooriq.com or through our Contact page form in the footer!";
  }

  return "ELVOORIQ is the premier talent management and live streaming platform built exclusively for women creators worldwide. Ask me about Creator Management, Brand Deals, Live Streaming, or Technical Support!";
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! 👋 I'm the ELVOORIQ AI Concierge. Ask me anything about our platform, creator management, or brand partnerships!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages, isThinking]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [
      ...messages,
      { id: Date.now(), sender: 'user', text, time: userTime }
    ];

    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setIsThinking(true);

    // Simulate AI thinking & response latency
    setTimeout(() => {
      const responseText = getAIResponse(text);
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: responseText, time: aiTime }
      ]);
      setIsThinking(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`floating-chat ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <X size={26} className="chat-icon" />
        ) : (
          <>
            <MessageCircle size={26} className="chat-icon" />
            {hasUnread && <span className="chat-unread-dot" />}
          </>
        )}
      </button>

      {/* AI Assistant Chat Modal Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-chat-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-avatar-container">
                  <img src={logoImg} alt="ELVOORIQ" className="ai-avatar-logo" />
                  <span className="ai-online-badge" />
                </div>
                <div>
                  <h4 className="ai-chat-title">
                    ELVOORIQ AI <Sparkles size={14} className="sparkle-icon" />
                  </h4>
                  <p className="ai-chat-subtitle">Smart Creator Concierge • Online</p>
                </div>
              </div>
              <button 
                className="ai-chat-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="ai-chat-body">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="bubble-avatar">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.sender}`}>
                    <p className="bubble-text">{msg.text}</p>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="bubble-avatar user-avatar">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="chat-bubble-row ai-row">
                  <div className="bubble-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="chat-bubble ai thinking-bubble">
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && !isThinking && (
              <div className="quick-prompts-container">
                <p className="quick-prompts-label">Suggested Questions:</p>
                <div className="quick-prompts-list">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button 
                      key={idx} 
                      className="quick-prompt-btn"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="ai-chat-input-bar">
              <input
                type="text"
                placeholder="Ask ELVOORIQ AI a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="ai-chat-input"
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isThinking}
                className="ai-chat-send-btn"
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChat;
