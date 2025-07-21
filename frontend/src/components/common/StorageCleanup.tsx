import { useEffect } from 'react'

const StorageCleanup: React.FC = () => {
  useEffect(() => {
    // One-time cleanup to fix duplicate wallet issues
    const cleanupVersion = '1.0.0'
    const lastCleanup = localStorage.getItem('btcminer-cleanup-version')
    
    if (lastCleanup !== cleanupVersion) {
      console.log('🧹 Performing one-time storage cleanup...')
      
      // Clear all wallet-related data
      localStorage.removeItem('btcminer-wallets')
      localStorage.removeItem('btcminer-wallet-connections')
      localStorage.removeItem('btcminer-wallet-state')
      
      // Clear any old theme data that might cause issues
      const currentTheme = localStorage.getItem('btcminer-theme')
      if (!currentTheme) {
        localStorage.setItem('btcminer-theme', 'dark')
      }
      
      // Mark cleanup as completed
      localStorage.setItem('btcminer-cleanup-version', cleanupVersion)
      
      console.log('✅ Storage cleanup completed successfully')
    }
  }, [])

  return null // This component doesn't render anything
}

export default StorageCleanup