
'use client';

import { useState, useEffect } from 'react';

interface FormattedDateProps {
  dateString: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

export function FormattedDate({ dateString, options, className }: FormattedDateProps) {
  const [clientFormattedDate, setClientFormattedDate] = useState<string | null>(null);

  // Server-side render a consistent, non-locale-specific format (e.g., YYYY-MM-DD)
  // This helps avoid hydration mismatch for the initial render.
  const serverFormattedDate = new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  useEffect(() => {
    // This effect runs only on the client after hydration
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setClientFormattedDate(new Date(dateString).toLocaleDateString(undefined, options || defaultOptions));
  }, [dateString, options]);

  // Render the client-side formatted date if available, otherwise fall back to server-rendered
  return <span className={className}>{clientFormattedDate || serverFormattedDate}</span>;
}
