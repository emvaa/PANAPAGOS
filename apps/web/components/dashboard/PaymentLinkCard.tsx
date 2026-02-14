'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { QrCode, Link2, Copy, Check, Share2, ExternalLink, Download } from 'lucide-react'
import QRCode from 'qrcode'

interface PaymentLinkCardProps {
  link: {
    id: string
    shortCode: string
    amount: number
    currency: string
    description: string
    paymentLink: string
    expiresAt: string
    createdAt: string
  }
  index: number
}

export function PaymentLinkCard({ link, index }: PaymentLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatAmount = (value: number, curr: string) => {
    // Ensure currency is valid
    const validCurrency = curr && (curr === 'PYG' || curr === 'USD') ? curr : 'PYG'
    
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: validCurrency === 'PYG' ? 0 : 2,
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link.paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link de Pago - PANAPAGOS',
          text: `${link.description}\nMonto: ${formatAmount(link.amount, link.currency)}`,
          url: link.paymentLink,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      handleCopy()
    }
  }

  const generateQR = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(link.paymentLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#D4AF37',
          light: '#050505',
        },
      })
      setQrDataUrl(dataUrl)
      setShowQR(true)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  const downloadQR = () => {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-${link.shortCode}.png`
    a.click()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="glass-card glass-card-hover p-6 relative overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gold/30 via-transparent to-silver/30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                {link.description}
              </h3>
              <p className="text-sm text-silver">
                Creado: {formatDate(link.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gradient">
                {formatAmount(link.amount, link.currency)}
              </p>
            </div>
          </div>

          {/* Link */}
          <div className="mb-4 p-3 bg-obsidian-light rounded-lg border border-gold/20">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-gold" />
              <span className="text-xs text-silver">Link de Pago</span>
            </div>
            <p className="text-sm text-white font-mono break-all">
              {link.paymentLink}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={generateQR}
              className="flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-semibold py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <QrCode className="w-4 h-4" />
              Ver QR
            </motion.button>

            <motion.button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold font-semibold py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-silver/10 hover:bg-silver/20 border border-silver/30 text-silver font-semibold py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </motion.button>

            <motion.a
              href={link.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-silver/10 hover:bg-silver/20 border border-silver/30 text-silver font-semibold py-3 rounded-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              Abrir
            </motion.a>
          </div>

          {/* Expiration */}
          <div className="mt-4 pt-4 border-t border-gold/20">
            <p className="text-xs text-silver">
              Expira: {formatDate(link.expiresAt)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* QR Modal */}
      {showQR && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-obsidian/95 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gradient mb-2">Código QR</h3>
            <p className="text-silver mb-6">{link.description}</p>

            {/* QR Code */}
            <div className="bg-obsidian-light p-6 rounded-xl border-2 border-gold/30 mb-6">
              <img src={qrDataUrl} alt="QR Code" className="w-full max-w-xs mx-auto" />
            </div>

            {/* Amount */}
            <p className="text-3xl font-bold text-gradient mb-6">
              {formatAmount(link.amount, link.currency)}
            </p>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={downloadQR}
                className="gold-gradient text-obsidian font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                Descargar
              </motion.button>

              <motion.button
                onClick={() => setShowQR(false)}
                className="bg-silver/10 border border-silver/30 text-silver font-bold py-3 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cerrar
              </motion.button>
            </div>

            <p className="text-xs text-silver/70 mt-4">
              Escanea este código con tu celular para pagar
            </p>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
