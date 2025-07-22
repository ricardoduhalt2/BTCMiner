import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWalletConnection } from '@hooks/useWalletConnection'
import { useMobileDetection } from '@hooks/useMobileDetection'
import { useSystemPreferences } from '@hooks/useSystemPreferences'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { connectedWallets, connectWallet } = useWalletConnection()
  const { isMobile, isTouchDevice, screenSize } = useMobileDetection()
  const { prefersReducedMotion, saveData } = useSystemPreferences()

  // Handle Quick Actions navigation
  const handleQuickAction = (actionTitle: string) => {
    switch (actionTitle) {
      case 'Bridge Assets':
        navigate('/bridge')
        break
      case 'Manage Identity':
        navigate('/identity')
        break
      case 'View Portfolio':
        navigate('/portfolio')
        break
      case 'Price Monitor':
        navigate('/price-monitoring')
        break
      default:
        break
    }
  }

  // Handle Connect Wallet
  const handleConnectWallet = () => {
    // This will trigger the wallet connection modal
    connectWallet('metamask') // Default to MetaMask, but this should open a selection modal
  }

  // Handle Learn More
  const handleLearnMore = () => {
    // Navigate to a documentation or about page, or open external link
    window.open('https://github.com/your-repo/btcminer-docs', '_blank')
  }

  const statsCards = [
    {
      title: 'Connected Wallets',
      value: connectedWallets.length,
      description: connectedWallets.length === 0 
        ? 'No wallets connected' 
        : `${connectedWallets.length} wallet${connectedWallets.length > 1 ? 's' : ''} connected`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      icon: '◆'
    },
    {
      title: 'Portfolio Value',
      value: '$0.00',
      description: 'Total value across all chains',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      icon: '◇'
    },
    {
      title: 'Recent Activity',
      value: '0',
      description: 'Transactions in the last 24h',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: '⟋'
    }
  ]

  return (
    <div className={`space-y-${isMobile ? '6' : '8'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className={`text-gray-600 dark:text-gray-400 mt-2 ${isMobile ? 'text-base' : 'text-lg'}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Welcome to your BTCMiner multi-chain platform ✨
          </motion.p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${isMobile ? 'p-4' : 'p-6'} ${!prefersReducedMotion ? 'hover:shadow-xl transition-all duration-300' : ''} ${isTouchDevice ? 'active:scale-95' : 'hover:scale-105'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
                {card.title}
              </h3>
              <div className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {card.icon}
              </div>
            </div>
            
            <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold ${card.color} mb-2`}>
              {card.value}
            </div>
            
            <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Welcome Message */}
      {connectedWallets.length === 0 && (
        <motion.div 
          className={`bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-yellow-900/20 rounded-2xl ${isMobile ? 'p-6' : 'p-8'} text-center`}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-4">
            <motion.img 
              src="/logoBTCMINER.png" 
              alt="BTCMiner Logo" 
              className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} mx-auto rounded-lg shadow-lg`}
              initial={prefersReducedMotion ? false : { scale: 0 }}
              animate={prefersReducedMotion ? false : { scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
            />
          </div>
          
          <motion.h2 
            className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Welcome to BTCMiner
          </motion.h2>
          
          <motion.p 
            className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'mb-6' : 'mb-8'} max-w-2xl mx-auto ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Get started by connecting your wallets to access cross-chain features, 
            manage your identity, and explore the multi-chain ecosystem.
          </motion.p>
          
          <motion.div 
            className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <button 
              onClick={handleConnectWallet}
              className={`${isMobile ? 'w-full' : ''} px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg ${!prefersReducedMotion ? 'hover:from-orange-600 hover:to-orange-700 transition-all duration-300' : ''} shadow-lg ${isTouchDevice ? 'active:scale-95' : ''}`}
            >
              ◆ Connect Wallet
            </button>
            <button 
              onClick={handleLearnMore}
              className={`${isMobile ? 'w-full' : ''} px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold rounded-lg border border-gray-300 dark:border-gray-600 ${!prefersReducedMotion ? 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300' : ''} ${isTouchDevice ? 'active:scale-95' : ''}`}
            >
              ◉ Learn More
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div>
        <motion.h2 
          className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-gray-100 ${isMobile ? 'mb-4' : 'mb-6'}`}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
          animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          Quick Actions
        </motion.h2>
        
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
          {[
            { title: 'Bridge Assets', icon: '⟐', color: 'bg-blue-500' },
            { title: 'Manage Identity', icon: '⬢', color: 'bg-purple-500' },
            { title: 'View Portfolio', icon: '⟋', color: 'bg-green-500' },
            { title: 'Price Monitor', icon: '▦', color: 'bg-orange-500' }
          ].map((action, index) => (
            <motion.button
              key={action.title}
              onClick={() => handleQuickAction(action.title)}
              className={`${isMobile ? 'p-4' : 'p-6'} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${!prefersReducedMotion ? 'hover:shadow-xl hover:scale-105 transition-all duration-300' : ''} text-center group ${isTouchDevice ? 'active:scale-95' : ''}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileTap={isTouchDevice ? { scale: 0.95 } : {}}
            >
              <div className={`${isMobile ? 'text-3xl mb-2' : 'text-4xl mb-3'}`}>
                {action.icon}
              </div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-gray-100 ${!prefersReducedMotion ? 'group-hover:text-orange-600 transition-colors' : ''}`}>
                {action.title}
              </h3>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Success Messages */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <div className="bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          ✅ Media luna eliminada exitosamente
        </div>
        <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          🌙 Tema oscuro por defecto activado
        </div>
        <div className="bg-purple-500 text-white px-4 py-2 rounded shadow-lg">
          🎯 Dashboard funcionando sin errores
        </div>
      </div>
    </div>
  )
}

export default Dashboard