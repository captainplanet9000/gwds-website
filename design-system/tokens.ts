// AUTO-GENERATED — edit tokens.json and run `node design-system/scripts/build-tokens.mjs`.
export const tokens = {
  "color": {
    "brand": {
      "accent": "oklch(0.65 0.29 295)",
      "accent-warm": "#D4A574",
      "electric-purple": "oklch(0.65 0.29 295)",
      "deep-purple": "oklch(0.58 0.32 290)",
      "light-purple": "oklch(0.75 0.20 295)",
      "cyan-bright": "oklch(0.75 0.15 195)",
      "cyan-deep": "oklch(0.65 0.18 195)"
    },
    "surface": {
      "background": "#000000",
      "near-black": "#050505",
      "card": "#12121A",
      "muted": "#1A1A2E"
    },
    "border": {
      "default": "rgba(232, 232, 232, 0.1)",
      "hover": "rgba(232, 232, 232, 0.3)",
      "strong": "oklch(0.20 0.03 260)"
    },
    "text": {
      "primary": "#E8E8E8",
      "secondary": "#A8A8A8",
      "muted": "#666666",
      "inverse": "#000000"
    },
    "semantic": {
      "success": "oklch(0.70 0.18 145)",
      "warning": "oklch(0.75 0.20 85)",
      "error": "oklch(0.65 0.25 25)",
      "info": "oklch(0.70 0.15 235)"
    }
  },
  "font": {
    "family": {
      "display": "Syne, 'Space Grotesk', sans-serif",
      "body": "'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      "mono": "'JetBrains Mono', 'Fira Code', Consolas, monospace"
    },
    "weight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700,
      "black": 800
    },
    "size": {
      "fluid": {
        "h1": "10vw",
        "h2": "6vw",
        "h3": "4vw",
        "h4": "2.5vw",
        "h5": "1.8vw",
        "h6": "1.5vw",
        "body": "1.2vw",
        "btn": "1vw"
      },
      "static": {
        "xs": "0.64rem",
        "sm": "0.8rem",
        "base": "1rem",
        "lg": "1.25rem",
        "xl": "1.563rem",
        "2xl": "1.953rem",
        "3xl": "2.441rem",
        "4xl": "3.052rem",
        "5xl": "3.815rem",
        "6xl": "4.768rem"
      }
    },
    "leading": {
      "tight": 1.1,
      "snug": 1.375,
      "normal": 1.5,
      "relaxed": 1.7,
      "loose": 2
    },
    "tracking": {
      "tighter": "-0.05em",
      "tight": "-0.03em",
      "normal": "0",
      "wide": "0.025em",
      "wider": "0.05em",
      "widest": "0.1em"
    }
  },
  "space": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "32": "8rem",
    "px": "1px",
    "0_5": "0.125rem",
    "fluid": {
      "xs": "2vh",
      "sm": "4vh",
      "md": "8vh",
      "lg": "10vh",
      "inline-sm": "3vw",
      "inline-md": "5vw"
    }
  },
  "radius": {
    "none": "0",
    "sm": "0.375rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "2xl": "1.5rem",
    "full": "9999px"
  },
  "border": {
    "width": {
      "0": "0",
      "thin": "1px",
      "med": "2px",
      "thick": "3px"
    }
  },
  "shadow": {
    "xs": "0 1px 2px rgba(0, 0, 0, 0.2)",
    "sm": "0 1px 2px rgba(0, 0, 0, 0.3)",
    "md": "0 4px 6px rgba(0, 0, 0, 0.4)",
    "lg": "0 10px 15px rgba(0, 0, 0, 0.5)",
    "xl": "0 20px 25px rgba(0, 0, 0, 0.6)",
    "glow-accent-sm": "0 0 20px rgba(139, 92, 246, 0.15)",
    "glow-accent-md": "0 0 30px rgba(139, 92, 246, 0.25)",
    "glow-accent-lg": "0 0 40px rgba(139, 92, 246, 0.35)"
  },
  "motion": {
    "duration": {
      "fast": "150ms",
      "base": "200ms",
      "slow": "300ms",
      "slower": "400ms"
    },
    "easing": {
      "linear": "linear",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  },
  "z": {
    "base": 0,
    "dropdown": 10,
    "sticky": 20,
    "fixed": 30,
    "modal-backdrop": 40,
    "modal": 50,
    "popover": 60,
    "tooltip": 70,
    "toast": 80,
    "max": 999
  },
  "breakpoint": {
    "xs": "375px",
    "sm": "640px",
    "md": "768px",
    "lg": "1024px",
    "xl": "1280px",
    "2xl": "1600px"
  },
  "layout": {
    "container-max": "1600px",
    "container-narrow": "1200px",
    "gutter": "5vw"
  },
  "component": {
    "button": {
      "padding-y": "1.2vw",
      "padding-x": "2.5vw",
      "font-size": "{font.size.fluid.btn}",
      "font-family": "{font.family.display}",
      "font-weight": "{font.weight.semibold}",
      "border-radius": "{radius.none}",
      "transition": "all 0.3s ease"
    },
    "card": {
      "background": "{color.surface.card}",
      "border": "{color.border.default}",
      "radius": "{radius.md}",
      "padding": "{space.6}"
    },
    "input": {
      "background": "transparent",
      "border": "{color.border.default}",
      "border-focus": "{color.brand.accent}",
      "padding-y": "{space.3}",
      "padding-x": "{space.4}"
    }
  }
} as const

export type Tokens = typeof tokens
