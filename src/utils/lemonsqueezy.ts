import { LEMONSQUEEZY_STORE_ID } from '../config/lemonsqueezy';

export function createCheckoutUrl(variantId: string, custom?: Record<string, string>) {
  // const baseUrl = `https://ai-retail.lemonsqueezy.com/checkout/`;
  const baseUrl = `https://ai-retail.lemonsqueezy.com/buy/7a85e85e-05ba-48da-9d3e-84c060b0548f`;
  
  if (custom) {
    const params = new URLSearchParams(custom);
    return `${baseUrl}`;
  }
  
  return baseUrl;
}
