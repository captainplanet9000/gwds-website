"use client";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, type Variants } from "framer-motion";
import { useRef, useState, useEffect, type ReactNode, type MouseEvent } from "react";

// Fade up animation for sections
export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  y = 30,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Scale up on hover
export function HoverScale({
  children,
  scale = 1.02,
  className,
  style,
}: {
  children: ReactNode;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      whileHover={{ scale, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// Stagger container
export function StaggerContainer({
  children,
  stagger = 0.08,
  className,
  style,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} style={style}>
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// Animated counter
export function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {value}{suffix}
    </motion.span>
  );
}

// Magnetic hover effect - tracks cursor position for magnetic pull
export function MagneticHover({ children, strength = 0.3, style }: { children: ReactNode; strength?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ ...style, x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

// 3D Tilt card effect
export function TiltCard({
  children,
  intensity = 10,
  style,
  className,
}: {
  children: ReactNode;
  intensity?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouse = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    rotateY.set(percentX * intensity);
    rotateX.set(-percentY * intensity);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        ...style,
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll section
export function ParallaxSection({
  children,
  speed = 0.3,
  style,
}: {
  children: ReactNode;
  speed?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} style={{ ...style, overflow: "hidden", position: "relative" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// Scroll-linked opacity + transform for sections
export function ScrollReveal({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "0.3 end"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  return (
    <motion.div ref={ref} style={{ ...style, opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

// Glow pulse animation
export function GlowOrb({ color, size, top, left, right, bottom }: {
  color: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}) {
  return (
    <motion.div
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(60px)",
        pointerEvents: "none",
      }}
    />
  );
}

// Shimmer skeleton loader
export function Skeleton({ width, height, borderRadius = 8, style }: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(90deg, rgba(139,92,246,0.04) 25%, rgba(139,92,246,0.08) 50%, rgba(139,92,246,0.04) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

// Image with zoom on hover
export function ZoomImage({ src, alt, style }: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      style={{
        ...style,
        overflow: "hidden",
        cursor: "zoom-in",
        position: "relative",
      }}
    >
      {!loaded && <Skeleton width="100%" height="100%" style={{ position: "absolute", inset: 0 }} />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.3s ease",
          transform: zoomed ? "scale(1.8)" : "scale(1)",
          transformOrigin: `${pos.x}% ${pos.y}%`,
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  );
}
