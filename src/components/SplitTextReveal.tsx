'use client';
import { useEffect, useRef, ElementType } from 'react';

interface Props {
  children: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}

export default function SplitTextReveal({ children, className, as: Tag = 'h2', delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let gsap: typeof import('gsap').gsap;
    let SplitText: typeof import('gsap/SplitText').SplitText;
    let ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
    let split: InstanceType<typeof SplitText> | null = null;

    const init = async () => {
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/SplitText');
      const scrollMod = await import('gsap/ScrollTrigger');

      gsap = gsapMod.gsap;
      SplitText = stMod.SplitText;
      ScrollTrigger = scrollMod.ScrollTrigger;

      if (typeof window !== 'undefined') {
        gsap.registerPlugin(SplitText, ScrollTrigger);
      }

      if (!ref.current) return;

      split = new SplitText(ref.current, { type: 'chars,words' });

      gsap.from(split.chars, {
        opacity: 0,
        y: 60,
        rotateX: -90,
        stagger: 0.025,
        duration: 0.7,
        ease: 'back.out(1.7)',
        delay,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
        },
      });
    };

    init().catch(console.error);

    return () => {
      if (split) split.revert();
    };
  }, [delay]);

  // Use a typed approach to avoid JSX intrinsic element issues
  const TagComponent = Tag as ElementType;
  return (
    <TagComponent ref={ref} className={className}>
      {children}
    </TagComponent>
  );
}
