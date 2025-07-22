import React from 'react'

interface ChainLogoProps {
  chain: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const ChainLogo: React.FC<ChainLogoProps> = ({ 
  chain, 
  size = 'md', 
  className = '' 
}) => {
  const getLogoPath = (chainName: string): string => {
    const chainMap: Record<string, string> = {
      'ethereum': '/logos/ethereum.svg',
      'ethereum sepolia': '/logos/ethereum.svg',
      'eth': '/logos/ethereum.svg',
      'bnb': '/logos/bnb.svg',
      'bnb chain': '/logos/bnb.svg',
      'bnb chain testnet': '/logos/bnb.svg',
      'bsc': '/logos/bnb.svg',
      'binance': '/logos/bnb.svg',
      'base': '/logos/base.svg',
      'base sepolia': '/logos/base.svg',
      'solana': '/logos/solana.svg',
      'solana devnet': '/logos/solana.svg',
      'sol': '/logos/solana.svg',
      'icp': '/ICP.png',
      'internet computer': '/ICP.png',
      'internet computer protocol': '/ICP.png',
      'dfinity': '/ICP.png'
    }
    
    const normalizedChain = chainName.toLowerCase().trim()
    return chainMap[normalizedChain] || '/logos/ethereum.svg' // fallback
  }

  const getSizeClasses = (size: string): string => {
    const sizeMap: Record<string, string> = {
      'sm': 'w-4 h-4',
      'md': 'w-6 h-6',
      'lg': 'w-8 h-8',
      'xl': 'w-12 h-12'
    }
    return sizeMap[size] || sizeMap['md']
  }

  const getChainName = (chainName: string): string => {
    const nameMap: Record<string, string> = {
      'ethereum sepolia': 'Ethereum',
      'bnb chain testnet': 'BNB Chain',
      'base sepolia': 'Base',
      'solana devnet': 'Solana',
      'internet computer': 'Internet Computer'
    }
    
    const normalizedChain = chainName.toLowerCase().trim()
    return nameMap[normalizedChain] || chainName
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={getLogoPath(chain)}
        alt={`${getChainName(chain)} logo`}
        className={`${getSizeClasses(size)} object-contain`}
        onError={(e) => {
          // Fallback to Ethereum logo if image fails to load
          const target = e.target as HTMLImageElement
          target.src = '/logos/ethereum.svg'
        }}
      />
    </div>
  )
}

export default ChainLogo