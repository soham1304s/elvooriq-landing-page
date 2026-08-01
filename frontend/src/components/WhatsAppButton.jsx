import React from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const phoneNumber = '917665761616';
  const message = encodeURIComponent('Hi ELVOORIQ, I would like to get in touch!');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Chat on WhatsApp"
    >
      <div className="whatsapp-pulse-ring" />
      <svg
        className="whatsapp-icon"
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 2A13 13 0 0 0 4.7 20.8L3 27.2l6.6-1.7A13 13 0 1 0 16 2zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-4 1 1.1-3.9-.3-.4a10.6 10.6 0 1 1 9-5zm5.8-7.9c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a8.1 8.1 0 0 1-2.4-1.5 8.9 8.9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6s.3-.4.5-.5a2.2 2.2 0 0 0 .3-.5.6.6 0 0 0 0-.6c-.1-.1-.7-1.7-1-2.3s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.2 2.8 6.4 6.4 0 0 0 1.4 3.4 14.6 14.6 0 0 0 5.6 5 18.7 18.7 0 0 0 1.9.7 4.5 4.5 0 0 0 2.1.1 3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.5c-.2-.1-.5-.2-.8-.4z"/>
      </svg>
      <span className="whatsapp-tooltip">Chat with us on WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
