import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: "class",
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
			"primary": "#004cb8",
			"on-surface": "#1a1c1e",
			"on-secondary-fixed-variant": "#00504b",
			"tertiary-fixed-dim": "#c5c7c8",
			"on-tertiary-container": "#edeeef",
			"surface": "#f9f9fc",
			"surface-container-high": "#e8e8ea",
			"on-error": "#ffffff",
			"secondary-fixed-dim": "#5adacf",
			"on-secondary": "#ffffff",
			"on-tertiary": "#ffffff",
			"surface-variant": "#e2e2e5",
			"inverse-on-surface": "#f0f0f3",
			"on-background": "#1a1c1e",
			"primary-fixed": "#dae2ff",
			"on-secondary-container": "#006f68",
			"tertiary": "#515455",
			"surface-tint": "#0056cf",
			"error": "#ba1a1a",
			"inverse-surface": "#2f3133",
			"on-primary": "#ffffff",
			"surface-container": "#eeeef0",
			"secondary": "#006a64",
			"on-primary-container": "#e9edff",
			"inverse-primary": "#b1c5ff",
			"surface-container-low": "#f3f3f6",
			"surface-dim": "#dadadc",
			"on-tertiary-fixed": "#191c1d",
			"secondary-fixed": "#7af6eb",
			"surface-container-lowest": "#ffffff",
			"on-tertiary-fixed-variant": "#454748",
			"tertiary-fixed": "#e1e3e4",
			"error-container": "#ffdad6",
			"outline-variant": "#c2c6d7",
			"primary-fixed-dim": "#b1c5ff",
			"surface-bright": "#f9f9fc",
			"on-surface-variant": "#424654",
			"on-primary-fixed": "#001947",
			"on-primary-fixed-variant": "#00419f",
			"primary-container": "#0c63e7",
			"secondary-container": "#77f4e8",
			"background": "#f9f9fc",
			"surface-container-highest": "#e2e2e5",
			"tertiary-container": "#6a6c6d",
			"on-secondary-fixed": "#00201d",
			"on-error-container": "#93000a",
			"outline": "#727786",
			// Keep standard variables mapping for shadcn backwards compat
  			background2: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
		borderRadius: {
			"DEFAULT": "0.25rem",
			"lg": "0.5rem",
			"xl": "0.75rem",
			"full": "9999px"
		},
		spacing: {
			"base": "8px",
			"margin-mobile": "16px",
			"sidebar-width": "280px",
			"gutter": "24px",
			"container-max": "1440px",
			"margin-desktop": "40px"
		},
		fontFamily: {
			"body-lg": ["var(--font-inter)", "sans-serif"],
			"data-mono": ["var(--font-jetbrains)", "monospace"],
			"headline-lg": ["var(--font-jakarta)", "sans-serif"],
			"headline-md": ["var(--font-jakarta)", "sans-serif"],
			"label-caps": ["var(--font-inter)", "sans-serif"],
			"headline-lg-mobile": ["var(--font-jakarta)", "sans-serif"],
			"display-lg": ["var(--font-jakarta)", "sans-serif"],
			"body-sm": ["var(--font-inter)", "sans-serif"],
			"body-md": ["var(--font-inter)", "sans-serif"]
		},
		fontSize: {
			"body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
			"data-mono": ["13px", { "lineHeight": "18px", "fontWeight": "450" }],
			"headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
			"headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
			"label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
			"headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
			"display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
			"body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
			"body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
		},
		keyframes: {
			fadeInUp: {
				'0%': { opacity: '0', transform: 'translate3d(0, 40px, 0)' },
				'100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
			},
			scan: {
				'0%': { top: '0%' },
				'50%': { top: '100%' },
				'100%': { top: '0%' },
			},
			subtlePulse: {
				'0%': { boxShadow: '0 0 0 0 rgba(0, 106, 100, 0.4)' },
				'70%': { boxShadow: '0 0 0 6px rgba(0, 106, 100, 0)' },
				'100%': { boxShadow: '0 0 0 0 rgba(0, 106, 100, 0)' },
			},
			glowPulse: {
				'0%, 100%': { boxShadow: '0 0 5px rgba(0, 106, 100, 0.2)', borderColor: 'rgba(0, 106, 100, 0.3)' },
				'50%': { boxShadow: '0 0 15px rgba(0, 106, 100, 0.6)', borderColor: 'rgba(0, 106, 100, 0.8)' },
			},
			bgShimmer: {
				'0%': { backgroundPosition: '-200% 0' },
				'100%': { backgroundPosition: '200% 0' },
			},
			marquee: {
				'0%': { transform: 'translateX(0%)' },
				'100%': { transform: 'translateX(-50%)' },
			},
			gradientText: {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
			}
		},
		animation: {
			'fade-in-up': 'fadeInUp 0.8s ease-out both',
			'scan': 'scan 2s ease-in-out infinite',
			'subtle-pulse': 'subtlePulse 2.5s infinite',
			'glow-pulse': 'glowPulse 2s infinite ease-in-out',
			'bg-shimmer': 'bgShimmer 1.5s infinite linear',
			'marquee': 'marquee 120s linear infinite',
			'gradient-text': 'gradientText 4s ease infinite'
		}
  	}
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
