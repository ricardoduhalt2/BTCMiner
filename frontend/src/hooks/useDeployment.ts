import { useState, useCallback } from 'react'

export interface ChainStatus {
  id: string
  name: string
  emoji: string
  status: 'pending' | 'deploying' | 'success' | 'failed'
  progress: number
  contractAddress?: string
  gasUsed?: string
  explorerUrl?: string
  deploymentTime?: number
  txHash?: string
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export interface DeploymentStats {
  totalChains: number
  successCount: number
  failedCount: number
  totalTime: number
  totalGas: number
  averageGas: number
}

const INITIAL_CHAINS: ChainStatus[] = [
  { id: 'ethereum', name: 'Ethereum Sepolia', emoji: 'ethereum', status: 'pending', progress: 0 },
  { id: 'bsc', name: 'BNB Chain Testnet', emoji: 'bnb', status: 'pending', progress: 0 },
  { id: 'base', name: 'Base Sepolia', emoji: 'base', status: 'pending', progress: 0 },
  { id: 'solana', name: 'Solana Devnet', emoji: 'solana', status: 'pending', progress: 0 },
  { id: 'icp', name: 'Internet Computer', emoji: 'icp', status: 'pending', progress: 0 }
]

export const useDeployment = () => {
  const [chains, setChains] = useState<ChainStatus[]>(INITIAL_CHAINS)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      message: '🚀 BTCMiner Deployment Dashboard initialized',
      type: 'info'
    },
    {
      id: '2',
      timestamp: new Date().toLocaleTimeString(),
      message: '📡 Ready to deploy across 5 chains...',
      type: 'info'
    }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStartTime, setDeploymentStartTime] = useState<number | null>(null)

  const addLogEntry = useCallback((message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }
    setLogs(prev => [...prev, newLog])
  }, [])

  const updateChainStatus = useCallback((chainId: string, status: ChainStatus['status'], data?: Partial<ChainStatus>) => {
    setChains(prev => prev.map(chain => 
      chain.id === chainId 
        ? { 
            ...chain, 
            status, 
            progress: status === 'success' ? 100 : status === 'deploying' ? 50 : status === 'failed' ? 100 : 0,
            ...data 
          }
        : chain
    ))
  }, [])

  const resetDeployment = useCallback(() => {
    setChains(INITIAL_CHAINS)
    setLogs([
      {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message: '🔄 Deployment reset - Ready for new deployment',
        type: 'info'
      }
    ])
    setIsDeploying(false)
    setDeploymentStartTime(null)
  }, [])

  const startDeployment = useCallback(async () => {
    if (isDeploying) {
      addLogEntry('⚠️ Deployment already in progress', 'warning')
      return
    }

    try {
      setIsDeploying(true)
      setDeploymentStartTime(Date.now())
      addLogEntry('🚀 Initiating multi-chain deployment...', 'info')
      
      // Reset all chains to pending
      setChains(prev => prev.map(chain => ({ ...chain, status: 'pending' as const, progress: 0 })))

      const timeouts: NodeJS.Timeout[] = []
      let completedChains = 0
      const totalChains = chains.length

      const checkCompletion = () => {
        completedChains++
        if (completedChains === totalChains) {
          addLogEntry('🎉 Multi-chain deployment sequence complete!', 'success')
          addLogEntry('🔗 Setting up cross-chain configurations...', 'info')
          setIsDeploying(false)
        }
      }

      for (let i = 0; i < totalChains; i++) {
        const chain = chains[i]
        
        // Start deployment with delay
        const startTimeout = setTimeout(() => {
          try {
            updateChainStatus(chain.id, 'deploying')
            addLogEntry(`🔄 Starting deployment on ${chain.name}...`, 'info')
          } catch (error) {
            console.error(`Error starting deployment on ${chain.name}:`, error)
            addLogEntry(`❌ Error starting deployment on ${chain.name}`, 'error')
            updateChainStatus(chain.id, 'failed')
            checkCompletion()
          }
        }, i * 1500)
        timeouts.push(startTimeout)

        // Complete deployment
        const completeTimeout = setTimeout(() => {
          try {
            const success = Math.random() > 0.15 // 85% success rate
            
            if (success) {
              const contractAddress = '0x' + Math.random().toString(16).substr(2, 40)
              const gasUsed = Math.floor(Math.random() * 500000 + 1000000)
              const txHash = '0x' + Math.random().toString(16).substr(2, 64)
              const deploymentTime = Math.floor(Math.random() * 30 + 10)
              
              updateChainStatus(chain.id, 'success', {
                contractAddress,
                gasUsed: gasUsed.toLocaleString(),
                explorerUrl: `https://explorer.example.com/tx/${txHash}`,
                deploymentTime,
                txHash
              })
              
              addLogEntry(`✅ ${chain.name} deployment successful! Address: ${contractAddress}`, 'success')
            } else {
              const error = getRandomError()
              updateChainStatus(chain.id, 'failed')
              addLogEntry(`❌ ${chain.name} deployment failed: ${error}`, 'error')
            }
          } catch (error) {
            console.error(`Error completing deployment on ${chain.name}:`, error)
            addLogEntry(`❌ Fatal error during ${chain.name} deployment`, 'error')
            updateChainStatus(chain.id, 'failed')
          } finally {
            checkCompletion()
          }
        }, (i + 1) * 2000 + Math.random() * 3000)
        timeouts.push(completeTimeout)
      }

      // Cleanup function
      return () => {
        timeouts.forEach(clearTimeout)
      }
    } catch (error) {
      console.error('Error in startDeployment:', error)
      addLogEntry('❌ Failed to start deployment process', 'error')
      setIsDeploying(false)
    }
  }, [chains, isDeploying, addLogEntry, updateChainStatus])

  const getRandomError = () => {
    const errors = [
      'Insufficient gas limit',
      'Network congestion detected',
      'Contract compilation failed',
      'RPC endpoint timeout',
      'Nonce too low',
      'Gas price too low'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  const getStats = useCallback((): DeploymentStats => {
    const successCount = chains.filter(chain => chain.status === 'success').length
    const failedCount = chains.filter(chain => chain.status === 'failed').length
    const totalGas = chains
      .filter(chain => chain.gasUsed)
      .reduce((sum, chain) => sum + parseInt(chain.gasUsed!.replace(/,/g, '')), 0)
    
    const totalTime = deploymentStartTime 
      ? Math.floor((Date.now() - deploymentStartTime) / 1000)
      : 0

    return {
      totalChains: chains.length,
      successCount,
      failedCount,
      totalTime,
      totalGas,
      averageGas: successCount > 0 ? Math.floor(totalGas / successCount) : 0
    }
  }, [chains, deploymentStartTime])

  return {
    chains,
    logs,
    isDeploying,
    stats: getStats(),
    addLogEntry,
    updateChainStatus,
    startDeployment,
    resetDeployment
  }
}