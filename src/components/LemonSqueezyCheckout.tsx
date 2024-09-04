import React from 'react';
import { createCheckoutUrl } from '../utils/lemonsqueezy';

interface LemonSqueezyCheckoutProps {
  variantId: string;
  custom?: Record<string, string>;
  buttonText?: string;
}

export function LemonSqueezyCheckout({ variantId, custom, buttonText = 'Buy Now' }: LemonSqueezyCheckoutProps) {
  const checkoutUrl = createCheckoutUrl(variantId, custom);

  return (
    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition-colors">
      {buttonText}
    </a>
  );
}
