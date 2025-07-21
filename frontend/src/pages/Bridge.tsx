import React, { useState } from 'react'
import { motion } from 'framer-motion'
import BridgeInterface from '@components/bridge/BridgeInterface'
import BridgeHistory from '@components/bridge/BridgeHistory'
import BridgeStats from '@components/bridge/BridgeStats'
import { useWalletConnection } from '@hooks/useWalletConnection'
import AnimatedPage from '@components/common/AnimatedPage'
import AnimatedContainer from '@components/common/AnimatedContainer'
import AnimatedList from '@components/common/AnimatedList'
import AnimatedButton from '@components/common/AnimatedButton'
import { NoWalletsEmpty } from '@components/common/EmptyState'
import { useAnimation } from '@components/common/AnimationProvider'

const Bridge: React.FC = () => {
  const { connectedWallets } = useWalletConnection()
  const { isAnimated } = useAnimation()
  const [activeTab, setActiveTab] = useState<'bridge' | 'history' | 'stats'>('bridge')

  const hasWallets = connectedWallets.length > 0

  const tabs = [
    { id: 'bridge', label: 'Bridge', icon: '⟐', color: 'text-blue-600' },
    { id: 'history', label: 'History', icon: '▦', color: 'text-purple-600' },
    { id: 'stats', label: 'Stats', icon: '⟋', color: 'text-green-600' },
  ] as const

  const handleConnectWallet = () => {
    // This would trigger wallet connection modal
    console.log('Connect wallet clicked')
  }

  return (
    <AnimatedPage animation="slide" className="space-y-8">
      {/* Header */}
      <AnimatedContainer animation="slideDown" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-500 bg-clip-text text-transparent"
            animate={isAnimated ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            } : {}}
            transition={isAnimated ? {
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            } : {}}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Cross-Chain Bridge ⟐
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Transfer BTCMiner tokens seamlessly across multiple blockchain networks
          </p>
        </div>
        
        {hasWallets && (
          <AnimatedContainer animation="slideLeft" delay={0.2}>
            <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
              <motion.div 
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={isAnimated ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                } : {}}
                transition={isAnimated ? {
                  duration: 2,
                  repeat: Infinity
                } : {}}
              />
              <span className="text-green-700 dark:text-green-300 font-medium">
                {connectedWallets.length} wallet{connectedWallets.length > 1 ? 's' : ''} connected
              </span>
            </div>
          </AnimatedContainer>
        )}
      </AnimatedContainer>

      {!hasWallets ? (
        /* No Wallets State with Enhanced Animation */
        <AnimatedContainer animation="scaleIn" delay={0.3}>
          <NoWalletsEmpty onConnect={handleConnectWallet} />
          
          {/* Bridge Features */}
          <div className="mt-12">
            <AnimatedContainer animation="slideUp" delay={0.5}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
                Why Use BTCMiner Bridge? ✨
              </h3>
            </AnimatedContainer>
            
            <AnimatedList 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              staggerDelay={0.1}
              animation="bounceIn"
            >
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Transfers complete in seconds', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { icon: '◇', title: 'Low Fees', desc: 'Minimal transaction costs', color: 'bg-green-50 dark:bg-green-900/20' },
                { icon: '⬢', title: 'Secure Protocol', desc: 'Battle-tested security', color: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: '◉', title: 'Multi-Chain', desc: 'Support for 10+ networks', color: 'bg-purple-50 dark:bg-purple-900/20' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`${feature.color} p-6 rounded-xl text-center hover-lift transition-all duration-300`}
                  whileHover={isAnimated ? { 
                    scale: 1.05,
                    rotate: [0, 1, -1, 0]
                  } : {}}
                >
                  <motion.div
                    className="text-4xl mb-3"
                    animate={isAnimated ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={isAnimated ? {
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    } : {}}
                  >
                    {feature.icon}
                  </motion.div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </AnimatedList>
          </div>
        </AnimatedContainer>
      ) : (
        /* Main Bridge Content with Enhanced Animations */
        <>
          {/* Tab Navigation with Smooth Animations */}
          <AnimatedContainer animation="slideUp" delay={0.2}>
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                  whileHover={isAnimated ? { scale: 1.02 } : {}}
                  whileTap={isAnimated ? { scale: 0.98 } : {}}
                >
                  <motion.span 
                    className="text-xl"
                    animate={isAnimated && activeTab === tab.id ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={isAnimated ? {
                      duration: 2,
                      repeat: Infinity
                    } : {}}
                  >
                    {tab.icon}
                  </motion.span>
                  <span>{tab.label}</span>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </AnimatedContainer>

          {/* Tab Content with Page Transitions */}
          <AnimatedContainer key={activeTab} animation="fadeIn" delay={0.1}>
            <motion.div
              initial={isAnimated ? { opacity: 0, x: 20 } : {}}
              animate={isAnimated ? { opacity: 1, x: 0 } : {}}
              exit={isAnimated ? { opacity: 0, x: -20 } : {}}
              transition={isAnimated ? { duration: 0.3 } : {}}
            >
              {activeTab === 'bridge' && <BridgeInterface />}
              {activeTab === 'history' && <BridgeHistory />}
              {activeTab === 'stats' && <BridgeStats />}
            </motion.div>
          </AnimatedContainer>
        </>
      )}
    </AnimatedPage>
  )
}

export default Bridge