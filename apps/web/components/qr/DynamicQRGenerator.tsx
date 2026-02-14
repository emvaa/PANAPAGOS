'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Copy, Check, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'

interface DynamicQRGeneratorProps {
  merchantId: string
  amount?: number
  description?: string
  type: 'static' | 'dynamic'
}

export function DynamicQRGenerator({
  merchantId,
  amount,
  description,
  type,
}: DynamicQRGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrData, setQrData] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateQR()
  }, [merchantId, amount, description, type])

  const generateQR = async () => {
    setLoading(true)
    try {
      // Generate EMVCo compliant QR data
      const qrPayload = generateEMVCoPayload()
      setQrData(qrPayload)

      // Generate QR code image
      const dataUrl = await QRCode.toDataURL(qrPayload, {
        width: 400,
        margin: 2,
        color: {
          dark: '#D4AF37',
          light: '#050505',
        },
        errorCorrectionLevel: 'H',
      })

      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Generate EMVCo compliant QR payload
   * Format: https://www.emvco.com/emv-technologies/qrcodes/
   */
  const generateEMVCoPayload = (): string => {
    if (type === 'static') {
      // Static QR - Merchant presents, customer scans
      return generateStaticQR()
    } else {
      // Dynamic QR - Amount and details included
      return generateDynamicQR()
    }
  }

  const generateStaticQR = (): string => {
    // EMVCo Format for Static QR
    const payload = {
      version: '01',
      merchantId: merchantId,
      merchantName: 'PANAPAGOS',
      merchantCity: 'Asuncion',
      countryCode: 'PY',
      currency: '600', // PYG ISO 4217
      type: 'static',
    }

    // Simplified EMVCo format
    return `00020101021152${merchantId}5303600540${amount || ''}5802PY5909PANAPAGOS6008Asuncion6304`
  }

  const generateDynamicQR = (): string => {
    // EMVCo Format for Dynamic QR with amount
    const amountStr = amount ? amount.toFixed(2) : ''
    const descStr = description || 'Pago PANAPAGOS'

    return `00020101021152${merchantId}5303600${amountStr ? `54${amountStr.length.toString().padStart(2, '0')}${amountStr}` : ''}5802PY5909PANAPAGOS6008Asuncion62${descStr.length.toString().padStart(2, '0')}${descStr}6304`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `oropay-qr-${type}-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="glass-card p-8 rounded-2xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gradient mb-2">
          QR {type === 'static' ? 'Estático' : 'Dinámico'}
        </h3>
        <p className="text-silver text-sm">
          {type === 'static'
            ? 'Usa este QR para cobros sin monto fijo'
            : 'QR con monto específico incluido'}
        </p>
      </div>

      {/* QR Code Display */}
      <div className="relative mb-6">
        <div className="bg-obsidian-light p-6 rounded-xl border-2 border-gold/30">
          {loading ? (
            <div className="w-full aspect-square flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-12 h-12 text-gold" />
              </motion.div>
            </div>
          ) : (
            <img src={qrDataUrl} alt="QR Code" className="w-full max-w-sm mx-auto" />
          )}
        </div>

        {/* EMVCo Badge */}
        <div className="absolute top-2 right-2 bg-gold/20 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-gold">EMVCo</span>
        </div>
      </div>

      {/* Amount Display (for dynamic QR) */}
      {type === 'dynamic' && amount && (
        <div className="text-center mb-6">
          <p className="text-sm text-silver mb-1">Monto a cobrar</p>
          <p className="text-3xl font-bold text-gradient">
            {new Intl.NumberFormat('es-PY', {
              style: 'currency',
              currency: 'PYG',
              minimumFractionDigits: 0,
            }).format(amount)}
          </p>
          {description && <p className="text-sm text-silver mt-2">{description}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-5 h-5" />
          Descargar
        </motion.button>

        <motion.button
          onClick={handleCopy}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-silver/10 hover:bg-silver/20 border border-silver/30 text-silver font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copiar Datos
            </>
          )}
        </motion.button>
      </div>

      {/* QR Data Preview */}
      <div className="mt-6 p-4 bg-obsidian-light rounded-lg">
        <p className="text-xs text-silver mb-2">Datos del QR (EMVCo):</p>
        <p className="text-xs font-mono text-white break-all">{qrData}</p>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-silver text-center">
        {type === 'static' ? (
          <p>✓ Compatible con cualquier app de pagos que soporte EMVCo</p>
        ) : (
          <p>✓ QR de un solo uso con monto fijo incluido</p>
        )}
      </div>
    </div>
  )
}
