import React, { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import '../PageStyles.css';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Creator Application', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout>
      <div className="page-hero">
        <div className="page-hero-badge">GET IN TOUCH</div>
        <h1 className="page-hero-title">Contact <span className="title-accent">ELVOORIQ Team</span></h1>
        <p className="page-hero-subtitle">
          Have questions about creator representation, brand partnerships, or technical support? We’re here to help.
        </p>
      </div>

      <div className="container page-content-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
          
          {/* Info Card */}
          <div className="glass-card">
            <h3 className="card-title" style={{ fontSize: '1.6rem', marginBottom: '24px' }}>Global Headquarters</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><MapPin size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Location</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>Global HQ • Digital Creator Center</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><Mail size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Email Support</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>support@elvooriq.com</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="card-icon" style={{ width: '44px', height: '44px', marginBottom: 0 }}><Phone size={20} /></div>
              <div>
                <h4 style={{ color: '#FFF', fontWeight: 600 }}>Agency Line</h4>
                <p style={{ color: '#A0A0B0', fontSize: '0.9rem' }}>+1 (800) 555-ELVOORIQ</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card">
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={54} color="#00C988" style={{ margin: '0 auto 16px' }} />
                <h3 className="card-title">Message Sent Successfully!</h3>
                <p className="card-desc">Thank you for reaching out. An ELVOORIQ representative will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="card-title" style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Send Us a Message</h3>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                    placeholder="Your Name"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                    placeholder="you@example.com"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Subject</label>
                  <select 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                  >
                    <option value="Creator Application" style={{ background: '#111' }}>Creator Application</option>
                    <option value="Brand Partnership Inquiry" style={{ background: '#111' }}>Brand Partnership Inquiry</option>
                    <option value="Technical Support" style={{ background: '#111' }}>Technical Support</option>
                    <option value="Press & Media" style={{ background: '#111' }}>Press & Media</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#AAA', fontSize: '0.85rem', marginBottom: '6px' }}>Message</label>
                  <textarea 
                    rows="4" 
                    required 
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#FFF' }}
                    placeholder="How can we assist you?"
                  ></textarea>
                </div>

                <button type="submit" className="btn-cta" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Message <Send size={16} />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
