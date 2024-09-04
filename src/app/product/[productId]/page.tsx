'use client'

import { useParams } from 'next/navigation'
import { LemonSqueezyCheckout } from '@/components/LemonSqueezyCheckout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from 'lucide-react'

export default function ProductDetail() {
  const params = useParams()
  const productId = 316769
  if (!productId) {
    return <div className="flex items-center justify-center h-screen">Product not found</div>
  }

  const product = {
    id: productId,
    name: `AI Chat Assistant Pro`,
    description: `Elevate your customer interactions with our advanced AI Chat Assistant. Powered by cutting-edge natural language processing, this tool provides intelligent, context-aware responses to enhance user engagement and streamline communication across your digital platforms.`,
    variantId: '459680',
    priceMonthly: 'IDR 10,000.00',
    priceYearly: 'IDR 100,000.00',
    savings: '17%',
    features: [
      'Advanced Natural Language Processing',
      'Multi-language Support',
      'Customizable Responses',
      'Real-time Learning and Adaptation',
      '24/7 Availability',
      'Seamless Integration with Existing Systems',
      'Analytics Dashboard',
      'Privacy and Security Compliance'
    ],
    includedFeatures: [
      'Unlimited AI-powered conversations',
      'Advanced analytics and insights',
      'Custom AI model training',
      'API access for seamless integration',
      'Dedicated account manager',
      'Priority support',
      'Compliance and security features',
      'Regular feature updates'
    ]
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 min-h-screen flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 flex-grow">
        {/* Card 1: Product Details */}
        <Card className="shadow-lg rounded-lg overflow-hidden flex-grow lg:w-2/3">
          <CardHeader className="bg-gray-100 p-3 sm:p-4">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{product.name}</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2 text-gray-600">{product.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 overflow-auto max-h-[calc(100vh-16rem)]">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-700">Key Features:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {product.features.map((feature, index) => (
                <li key={index} className="text-xs sm:text-sm">{feature}</li>
              ))}
            </ul>
            <div className="mt-3 sm:mt-4">
              <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-700">Why Choose Our AI Chat Assistant?</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Our AI Chat Assistant leverages state-of-the-art machine learning algorithms to understand and respond to user queries with unprecedented accuracy. It continuously learns from interactions, improving its performance over time. With multi-language support and customizable responses, it adapts to your brand voice and caters to a global audience. The intuitive analytics dashboard provides valuable insights into user interactions, helping you refine your communication strategies.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-100 p-3 sm:p-4">
            <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white w-full lg:w-auto text-xs sm:text-sm">Learn More</Button>
          </CardFooter>
        </Card>

        {/* Card 2: Price and Buy Button */}
        <Card className="shadow-lg rounded-lg overflow-hidden w-full lg:w-1/3 lg:max-w-sm flex flex-col">
          <CardHeader className="bg-gray-100 p-3 sm:p-4">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-800">Pricing Plans</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 flex-grow">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">Monthly Plan</h3>
                <Badge variant="secondary" className="text-xs sm:text-sm bg-blue-500 text-white p-1 sm:p-2 rounded w-full text-center">
                  {product.priceMonthly}/month
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base mb-1">Yearly Plan</h3>
                <Badge variant="secondary" className="text-xs sm:text-sm bg-green-500 text-white p-1 sm:p-2 rounded w-full text-center">
                  {product.priceYearly}/year
                </Badge>
                <p className="text-xs text-green-600 mt-1 text-center">Save {product.savings} with annual billing</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">What&lsquo;s Included:</h4>
              <ul className="space-y-1">
                {product.includedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center text-xs text-gray-600">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-100 p-3 sm:p-4">
            <LemonSqueezyCheckout 
              variantId={product.variantId}
              custom={{ product_id: product.id.toString() }}
              buttonText="Buy Product"
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}