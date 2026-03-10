'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Product Question',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('success');
      setFormData({ name: '', email: '', subject: 'Product Question', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <main
        style={{
          paddingTop: '15vh',
          minHeight: '100vh',
          background: '#000',
          paddingBottom: '10vh',
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8vh' }}>
            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '8vw',
                fontWeight: 800,
                color: '#E8E8E8',
                marginBottom: '16px',
              }}
            >
              Get in Touch
            </h1>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1rem',
                color: '#A8A8A8',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              Questions about products, licensing, collaborations, or custom work? We'd love to hear
              from you.
            </p>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            style={{
              border: '1px solid rgba(232, 232, 232, 0.1)',
              background: '#050505',
              padding: '32px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '16px',
              }}
              className="form-row"
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#A8A8A8',
                    marginBottom: '8px',
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.9rem',
                    background: '#000',
                    border: '1px solid rgba(232, 232, 232, 0.2)',
                    color: '#E8E8E8',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.65 0.29 295)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: '#A8A8A8',
                    marginBottom: '8px',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.9rem',
                    background: '#000',
                    border: '1px solid rgba(232, 232, 232, 0.2)',
                    color: '#E8E8E8',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.65 0.29 295)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#A8A8A8',
                  marginBottom: '8px',
                }}
              >
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={status === 'loading' || status === 'success'}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.9rem',
                  background: '#000',
                  border: '1px solid rgba(232, 232, 232, 0.2)',
                  color: '#E8E8E8',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option>Product Question</option>
                <option>Custom Work</option>
                <option>Collaboration</option>
                <option>Licensing</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#A8A8A8',
                  marginBottom: '8px',
                }}
              >
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={status === 'loading' || status === 'success'}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.9rem',
                  background: '#000',
                  border: '1px solid rgba(232, 232, 232, 0.2)',
                  color: '#E8E8E8',
                  outline: 'none',
                  resize: 'vertical',
                  lineHeight: 1.6,
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'oklch(0.65 0.29 295)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              style={{
                width: '100%',
                padding: '14px',
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 600,
                background: 'oklch(0.65 0.29 295)',
                color: '#000',
                border: 'none',
                cursor: status === 'loading' || status === 'success' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: status === 'loading' || status === 'success' ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (status === 'idle' || status === 'error') {
                  e.currentTarget.style.background = '#E8E8E8';
                }
              }}
              onMouseLeave={(e) => {
                if (status === 'idle' || status === 'error') {
                  e.currentTarget.style.background = 'oklch(0.65 0.29 295)';
                }
              }}
            >
              {status === 'loading'
                ? 'Sending...'
                : status === 'success'
                ? 'Message Sent!'
                : 'Send Message'}
            </button>

            {status === 'success' && (
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.85rem',
                  color: 'oklch(0.65 0.29 295)',
                  marginTop: '1.5vw',
                  textAlign: 'center',
                }}
              >
                Thanks for reaching out! We'll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.85rem',
                  color: '#EF4444',
                  marginTop: '1.5vw',
                  textAlign: 'center',
                }}
              >
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>

          {/* Direct Contact */}
          <div style={{ textAlign: 'center', marginTop: '6vh' }}>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.85rem',
                color: '#A8A8A8',
                marginBottom: '1vh',
              }}
            >
              Or reach out directly:
            </p>
            <a
              href="mailto:gammawavesdesign@gmail.com"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'oklch(0.65 0.29 295)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E8E8E8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'oklch(0.65 0.29 295)';
              }}
            >
              gammawavesdesign@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 14vw !important;
          }
          p {
            font-size: 4vw !important;
          }
          .form-row {
            grid-template-columns: 1fr !important;
          }
          label {
            font-size: 3.5vw !important;
          }
          input,
          select,
          textarea,
          button {
            padding: 3vw !important;
            font-size: 4vw !important;
          }
        }
      `}</style>
    </>
  );
}
