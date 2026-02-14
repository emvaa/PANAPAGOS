'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { GlowCursor } from '@/components/ui/GlowCursor'
import { PaymentSummary } from '@/components/checkout/PaymentSummary'
import { CardForm, CardFormData } from '@/components/checkout/CardForm'

interface PaymentDetails {
  transactionId: string
  amount: number
  currency: 'PYG' | 'USD'
  description: string
  merchantName: string
  expiresAt: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentDetails()
  }, [params.shortCode])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/checkout/link/${params.shortCode}`)
      
      if (!response.ok) {
        throw new Error('Payment link not found or expired')
      }

      const data = await response.json()
      setPaymentDetails(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (formData: CardFormData) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/checkout/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: paymentDetails?.transactionId,
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolder: formData.cardHolder,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          ipAddress: 'client-ip',
          userAgent: navigator.userAgent,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPaymentResult('success')
        setTimeout(() => {
          router.push(`/payment/success/${result.transactionId}`)
        }, 2000)
      } else {
        setPaymentResult('error')
        setError(result.message || 'Payment failed')
      }
    } catch (err: any) {
      setPaymentResult('error')
      setError('An error occurred while processing your payment')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlowCursor />
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    )
  }

  if (error && !paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlowCursor />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md text-center"
        >
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Link Inválido</h1>
          <p className="text-silver">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <GlowCursor />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gradient mb-4">PANAPAGOS</h1>
          <p className="text-silver">Experiencia de pago premium</p>
        </motion.div>

        {/* Payment Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {paymentDetails && (
            <>
              <PaymentSummary
                amount={paymentDetails.amount}
                currency={paymentDetails.currency}
                description={paymentDetails.description}
                merchantName={paymentDetails.merchantName}
              />
              <CardForm onSubmit={handlePayment} isProcessing={isProcessing} />
            </>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && paymentResult === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 glass-card p-6 border-red-500/50 max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Overlay */}
        <AnimatePresence>
          {paymentResult === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/95 backdrop-blur-xl flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-gold mx-auto mb-6" />
                </motion.div>
                <h2 className="text-4xl font-bold text-gradient mb-4">¡Pago Exitoso!</h2>
                <p className="text-silver text-lg">Redirigiendo...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
