import { cn } from '@/lib/utils'

// Typography utility functions for consistent text styling
export const typography = {
  // Display headings - use Poppins for large, impactful text
  display: {
    h1: cn(
      'font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h2: cn(
      'font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h3: cn(
      'font-heading text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
  },

  // Content headings - use Poppins for section headers
  heading: {
    h1: cn(
      'font-heading text-3xl md:text-4xl font-bold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h2: cn(
      'font-heading text-2xl md:text-3xl font-semibold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h3: cn(
      'font-heading text-xl md:text-2xl font-semibold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h4: cn(
      'font-heading text-lg md:text-xl font-semibold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h5: cn(
      'font-heading text-base md:text-lg font-semibold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
    h6: cn(
      'font-heading text-sm md:text-base font-semibold tracking-tight leading-tight',
      'text-gray-900 dark:text-white'
    ),
  },

  // Body text - use Inter for readable content
  body: {
    large: cn(
      'font-body text-lg leading-relaxed tracking-wide',
      'text-gray-800 dark:text-gray-200'
    ),
    base: cn(
      'font-body text-base leading-relaxed tracking-wide',
      'text-gray-800 dark:text-gray-200'
    ),
    small: cn(
      'font-body text-sm leading-relaxed tracking-wide',
      'text-gray-700 dark:text-gray-300'
    ),
    xs: cn(
      'font-body text-xs leading-relaxed tracking-wide',
      'text-gray-600 dark:text-gray-400'
    ),
  },

  // UI text - use Geist for interface elements
  ui: {
    large: cn(
      'font-sans text-lg font-medium leading-tight tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    base: cn(
      'font-sans text-base font-medium leading-tight tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    small: cn(
      'font-sans text-sm font-medium leading-tight tracking-wide',
      'text-gray-800 dark:text-gray-200'
    ),
    xs: cn(
      'font-sans text-xs font-medium leading-tight tracking-wide',
      'text-gray-700 dark:text-gray-300'
    ),
  },

  // Caption and metadata - use Inter for small text
  caption: {
    base: cn(
      'font-body text-sm leading-tight tracking-wide',
      'text-gray-600 dark:text-gray-400'
    ),
    small: cn(
      'font-body text-xs leading-tight tracking-wide',
      'text-gray-500 dark:text-gray-500'
    ),
  },

  // Code text - use JetBrains Mono for technical content
  code: {
    large: cn(
      'font-code text-lg leading-tight tracking-wide',
      'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'
    ),
    base: cn(
      'font-code text-base leading-tight tracking-wide',
      'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'
    ),
    small: cn(
      'font-code text-sm leading-tight tracking-wide',
      'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'
    ),
    inline: cn(
      'font-code text-sm leading-tight tracking-wide',
      'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded'
    ),
  },

  // Button text - use Geist for interactive elements
  button: {
    large: cn(
      'font-sans text-lg font-semibold leading-none tracking-wide',
      'text-white'
    ),
    base: cn(
      'font-sans text-base font-semibold leading-none tracking-wide',
      'text-white'
    ),
    small: cn(
      'font-sans text-sm font-semibold leading-none tracking-wide',
      'text-white'
    ),
    xs: cn(
      'font-sans text-xs font-semibold leading-none tracking-wide',
      'text-white'
    ),
  },

  // Form text - use Inter for form elements
  form: {
    label: cn(
      'font-body text-sm font-medium leading-tight tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    input: cn(
      'font-body text-base leading-tight tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    helper: cn(
      'font-body text-sm leading-tight tracking-wide',
      'text-gray-600 dark:text-gray-400'
    ),
    error: cn(
      'font-body text-sm leading-tight tracking-wide',
      'text-red-600 dark:text-red-400'
    ),
  },

  // Navigation text - use Geist for navigation elements
  nav: {
    large: cn(
      'font-sans text-lg font-medium leading-none tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    base: cn(
      'font-sans text-base font-medium leading-none tracking-wide',
      'text-gray-900 dark:text-white'
    ),
    small: cn(
      'font-sans text-sm font-medium leading-none tracking-wide',
      'text-gray-700 dark:text-gray-300'
    ),
  },

  // Special text styles
  special: {
    // Gradient text for special elements
    gradient: cn(
      'font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
      'bg-clip-text text-transparent'
    ),
    
    // Accent text for highlights
    accent: cn(
      'font-body font-semibold',
      'text-blue-600 dark:text-blue-400'
    ),
    
    // Success text
    success: cn(
      'font-body font-medium',
      'text-green-600 dark:text-green-400'
    ),
    
    // Warning text
    warning: cn(
      'font-body font-medium',
      'text-yellow-600 dark:text-yellow-400'
    ),
    
    // Error text
    error: cn(
      'font-body font-medium',
      'text-red-600 dark:text-red-400'
    ),
  },
}

// Utility function to combine typography classes with additional classes
export function text(
  variant: keyof typeof typography,
  size: string,
  additionalClasses?: string
) {
  const baseClasses = typography[variant as keyof typeof typography]
  if (typeof baseClasses === 'object' && size in baseClasses) {
    return cn(baseClasses[size as keyof typeof baseClasses], additionalClasses)
  }
  return cn(baseClasses, additionalClasses)
}

// Export individual typography classes for direct use
export const {
  display,
  heading,
  body,
  ui,
  caption,
  code,
  button,
  form,
  nav,
  special,
} = typography
