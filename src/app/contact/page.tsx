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

  const disabled = status === 'loading' || status === 'success';

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ paddingTop: '150px', minHeight: '100vh', paddingBottom: '96px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 28px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h1 style={{ fontSize: 'clamp(36px,6vw,58px)', letterSpacing: '-0.015em', margin: '0 0 14px' }}>
              Get in Touch
            </h1>
            <p style={{ fontSize: 15.5, color: 'var(--color-neutral-700)', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              Questions about products, licensing, collaborations, or custom work? We&apos;d love to hear
              from you.
            </p>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="card"
            style={{ padding: 32, borderRadius: 'calc(var(--radius-lg) * 1.15)', gap: 18 }}
          >
            <div
              data-cv-2col
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
              }}
            >
              <div className="field">
                <label>Name</label>
                <input
                  className="input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="field">
              <label>Subject</label>
              <select
                className="input"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={disabled}
                style={{ cursor: 'pointer' }}
              >
                <option>Product Question</option>
                <option>Custom Work</option>
                <option>Collaboration</option>
                <option>Licensing</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field">
              <label>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={disabled}
                rows={6}
                className="input"
                style={{
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  resize: 'vertical',
                  lineHeight: 1.6,
                  minHeight: 'unset',
                }}
              />
            </div>

            <button type="submit" disabled={disabled} className="btn btn-primary btn-block" style={{ height: 50, fontSize: 15 }}>
              {status === 'loading'
                ? 'Sending...'
                : status === 'success'
                ? 'Message Sent!'
                : 'Send Message'}
            </button>

            {status === 'success' && (
              <p style={{ fontSize: 13.5, color: 'var(--color-accent-700)', textAlign: 'center', margin: 0 }}>
                Thanks for reaching out! We&apos;ll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p style={{ fontSize: 13.5, color: 'var(--color-accent-2-700)', textAlign: 'center', margin: 0 }}>
                Something went wrong. Please try again or email us directly.
              </p>
            )}
          </form>

          {/* Direct Contact */}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', marginBottom: 8 }}>
              Or reach out directly:
            </p>
            <a
              href="mailto:gammawavesdesign@gmail.com"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}
            >
              gammawavesdesign@gmail.com
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
