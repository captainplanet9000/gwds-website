'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ImageDistortion from './ImageDistortion';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Cival Trading Dashboard',
    category: 'Web Application',
    image: '/images/projects/cival.jpg',
    description: 'Real-time trading dashboard with autonomous agent integration',
  },
  {
    id: '2',
    title: 'The 400 Club NFTs',
    category: 'Digital Collectibles',
    image: '/images/projects/400club.jpg',
    description: '9,400-piece generative NFT collection on Ethereum',
  },
  {
    id: '3',
    title: 'AI Content Pipeline',
    category: 'Automation',
    image: '/images/projects/pipeline.jpg',
    description: 'Automated video generation and distribution system',
  },
];

export default function WorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    projectRefs.current.forEach((project, index) => {
      if (!project) return;

      gsap.fromTo(
        project,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: project,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '15vh 5vw',
        background: '#000',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '10vh' }}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '6vw',
              fontWeight: 700,
              color: '#E8E8E8',
              marginBottom: '2vw',
            }}
          >
            Selected Work
          </h2>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.5vw',
              color: '#A8A8A8',
              maxWidth: '600px',
            }}
          >
            A collection of digital products, tools, and creative experiments.
          </p>
        </div>

        {/* Projects Grid */}
        <div
          style={{
            display: 'grid',
            gap: '10vh',
          }}
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={(el) => {
                projectRefs.current[index] = el;
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: index % 2 === 0 ? '1.2fr 1fr' : '1fr 1.2fr',
                gap: '5vw',
                alignItems: 'center',
              }}
              className="project-card"
            >
              {/* Image (order changes based on index) */}
              <div
                style={{
                  gridColumn: index % 2 === 0 ? '1' : '2',
                  aspectRatio: '16 / 10',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0A0A0A',
                }}
              >
                <ImageDistortion
                  imageUrl={project.image}
                  intensity={0.5}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Text Content */}
              <div
                style={{
                  gridColumn: index % 2 === 0 ? '2' : '1',
                  padding: '2vw 0',
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.9vw',
                    fontWeight: 500,
                    color: 'oklch(0.65 0.29 295)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '1.5vw',
                  }}
                >
                  {project.category}
                </div>
                <h3
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '3vw',
                    fontWeight: 700,
                    color: '#E8E8E8',
                    marginBottom: '2vw',
                    lineHeight: 1.2,
                  }}
                >
                  {project.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '1.2vw',
                    lineHeight: 1.7,
                    color: '#A8A8A8',
                    marginBottom: '3vw',
                  }}
                >
                  {project.description}
                </p>
                <a
                  href="#"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '1vw',
                    fontWeight: 600,
                    color: '#E8E8E8',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.8vw',
                    borderBottom: '1px solid rgba(232, 232, 232, 0.3)',
                    paddingBottom: '0.3vw',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'oklch(0.65 0.29 295)';
                    e.currentTarget.style.borderColor = 'oklch(0.65 0.29 295)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#E8E8E8';
                    e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.3)';
                  }}
                >
                  View Project
                  <span style={{ fontSize: '1.2vw' }}>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .project-card {
            grid-template-columns: 1fr !important;
            gap: 6vw !important;
          }
          .project-card > * {
            grid-column: 1 !important;
          }
          h2 {
            font-size: 12vw !important;
          }
          h3 {
            font-size: 8vw !important;
          }
          p {
            font-size: 4vw !important;
          }
        }
      `}</style>
    </section>
  );
}
