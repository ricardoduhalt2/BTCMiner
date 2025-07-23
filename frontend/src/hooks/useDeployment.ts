import { useState, useCallback, useEffect, useMemo } from 'react'
import { ethers, BrowserProvider, JsonRpcSigner, Contract, InterfaceAbi } from 'ethers'
import * as BTCMinerABI from '../contracts/BTCMiner.json'

// Asegurar que el ABI tenga el tipo correcto
const BTCMinerABI_ABI = BTCMinerABI.abi as InterfaceAbi

// Configuración de la red Sepolia con datos reales desde el deployment
const SEPOLIA_CONFIG = {
  id: 'ethereum',
  name: 'Ethereum Sepolia',
  emoji: 'ethereum',
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io',
  chainId: 11155111,
  contractAddress: '0xc39A8ecD3492083723dd55f09BF0838F93E9fa42', // Contrato real desplegado
  explorerUrl: 'https://sepolia.etherscan.io',
  txHash: '0x6328b5d32fe5b7b10c197d6437d6febb6238826e9363d265c81b84993b317e97', // TX real de deployment
  deployer: '0xB4784dc9c060BB06Ac1aF0C231f3638fEa5CB8Df',
  gasUsed: '4951458',
  deploymentTime: 1753219477844
};

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
  { 
    id: SEPOLIA_CONFIG.id,
    name: SEPOLIA_CONFIG.name,
    emoji: SEPOLIA_CONFIG.emoji,
    status: 'success' as const, 
    progress: 100,
    contractAddress: SEPOLIA_CONFIG.contractAddress,
    gasUsed: SEPOLIA_CONFIG.gasUsed,
    explorerUrl: `${SEPOLIA_CONFIG.explorerUrl}/address/${SEPOLIA_CONFIG.contractAddress}`,
    deploymentTime: Math.floor(SEPOLIA_CONFIG.deploymentTime / 1000),
    txHash: SEPOLIA_CONFIG.txHash
  },
  { id: 'bsc', name: 'BNB Chain Testnet', emoji: 'bnb', status: 'pending', progress: 0 },
  { id: 'base', name: 'Base Sepolia', emoji: 'base', status: 'pending', progress: 0 },
  { id: 'solana', name: 'Solana Devnet', emoji: 'solana', status: 'pending', progress: 0 },
  { id: 'icp', name: 'Internet Computer', emoji: 'icp', status: 'pending', progress: 0 }
]

export const useDeployment = () => {
  const [chains, setChains] = useState<ChainStatus[]>(INITIAL_CHAINS)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: '🎯 BTCMiner Multi-Chain Deployment Dashboard Initialized',
      type: 'info'
    },
    {
      id: (Date.now() + 1).toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: `✅ Ethereum Sepolia: Contract deployed at ${SEPOLIA_CONFIG.contractAddress}`,
      type: 'success'
    },
    {
      id: (Date.now() + 2).toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: `🔗 Explorer: ${SEPOLIA_CONFIG.explorerUrl}/address/${SEPOLIA_CONFIG.contractAddress}`,
      type: 'info'
    },
    {
      id: (Date.now() + 3).toString(),
      timestamp: new Date().toLocaleTimeString(),
      message: '🚀 Ready to interact with deployed contracts! Click "Start Deployment" to begin.',
      type: 'info'
    }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStartTime, setDeploymentStartTime] = useState<number | null>(null)
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>('')

  // Inicializar conexión con MetaMask
  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Verificar si ya hay cuentas conectadas (sin solicitar acceso)
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            
            // Configurar el proveedor y el firmante
            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            setProvider(web3Provider)
            
            const signer = await web3Provider.getSigner()
            setSigner(signer)
            
            // Crear instancia del contrato
            const btcMinerContract = new ethers.Contract(
              SEPOLIA_CONFIG.contractAddress,
              BTCMinerABI_ABI,
              signer
            )
            setContract(btcMinerContract)
            setIsConnected(true)
            
            addLogEntry('🔗 Conectado a MetaMask', 'success')
            addLogEntry(`👤 Cuenta: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`, 'info')
            addLogEntry(`🌐 Red: ${SEPOLIA_CONFIG.name}`, 'info')
            
            // Escuchar cambios de cuenta
            window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
              if (newAccounts.length > 0) {
                setAccount(newAccounts[0])
                addLogEntry(`🔄 Cuenta cambiada: ${newAccounts[0].substring(0, 6)}...`, 'info')
              } else {
                setIsConnected(false)
                setAccount('')
                addLogEntry('🔴 Desconectado de MetaMask', 'warning')
              }
            })
            
            // Escuchar cambios de red
            window.ethereum.on('chainChanged', (chainId: string) => {
              const chainIdNumber = parseInt(chainId, 16)
              if (chainIdNumber !== SEPOLIA_CONFIG.chainId) {
                addLogEntry(`⚠️ Por favor cambia a la red ${SEPOLIA_CONFIG.name} (Chain ID: ${SEPOLIA_CONFIG.chainId})`, 'warning')
              }
              window.location.reload()
            })
          }
        } catch (error) {
          console.error('Error al conectar con MetaMask:', error)
          addLogEntry('❌ Error al conectar con MetaMask', 'error')
        }
      } else {
        addLogEntry('⚠️ Por favor instala MetaMask para interactuar con la aplicación', 'warning')
      }
    }
    
    init()
    
    return () => {
      // Limpiar listeners al desmontar
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      }
    }
  }, [])

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

  // Función para conectar a MetaMask
  const connectWallet = useCallback(async (): Promise<ethers.Contract | null> => {
    if (!window.ethereum) {
      addLogEntry('⚠️ Por favor instala MetaMask para continuar', 'warning')
      return null
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)
      
      // Solicitar acceso a la cuenta
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        setSigner(signer)
        const currentAccount = accounts[0]
        setAccount(currentAccount)
        setIsConnected(true)
        
        // Inicializar el contrato
        const contractInstance = new ethers.Contract(
          SEPOLIA_CONFIG.contractAddress,
          BTCMinerABI_ABI,
          signer
        )
        setContract(contractInstance)
        addLogEntry('✅ Billetera conectada correctamente', 'success')
        return contractInstance
      }
      
    } catch (error: any) {
      console.error('Error al conectar con MetaMask:', error)
      const errorMessage = error?.message || 'Error desconocido al conectar con MetaMask'
      addLogEntry(`❌ ${errorMessage}`, 'error')
      return null
    }
    return null
  }, [addLogEntry])

  const startDeployment = useCallback(async (): Promise<void> => {
    // Si ya hay un despliegue en curso, no hacer nada
    if (isDeploying) {
      addLogEntry('⏳ Ya hay una operación en curso...', 'info')
      return
    }

    // Inicializar el estado
    setIsDeploying(true)
    setDeploymentStartTime(Date.now())
    
    try {
      // Si no hay contrato, intentar conectar primero
      let contractInstance = contract
      if (!contractInstance) {
        contractInstance = await connectWallet()
        if (!contractInstance) {
          addLogEntry('⚠️ No se pudo conectar a MetaMask', 'error')
          setIsDeploying(false)
          return
        }
      }

      // Asegurarse de que tenemos una cuenta
      const currentAccount = account || (await window.ethereum.request({ method: 'eth_accounts' }))[0]
      if (!currentAccount) {
        throw new Error('No se pudo obtener la cuenta de MetaMask')
      }
      
      addLogEntry('🚀 Iniciando interacción con el contrato BTCMiner...', 'info')
      
      // Verificar que estamos en la red correcta
      const network = await provider?.getNetwork()
      if (network && Number(network.chainId) !== SEPOLIA_CONFIG.chainId) {
        addLogEntry(`⚠️ Red incorrecta. Por favor cambia a ${SEPOLIA_CONFIG.name} (Chain ID: ${SEPOLIA_CONFIG.chainId})`, 'warning')
        try {
          // Intentar cambiar a Sepolia automáticamente
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${SEPOLIA_CONFIG.chainId.toString(16)}` }],
          })
          addLogEntry('✅ Red cambiada a Sepolia exitosamente', 'success')
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            addLogEntry('❌ Red Sepolia no configurada en MetaMask', 'error')
          }
          throw new Error('Por favor cambia manualmente a la red Sepolia en MetaMask')
        }
      }
      
      // Verificar el saldo del token
      addLogEntry('🔍 Verificando saldo del token...', 'info')
      const balance = await contractInstance.balanceOf(currentAccount)
      const decimals = await contractInstance.decimals()
      const formattedBalance = ethers.formatUnits(balance, decimals)
      
      addLogEntry(`💰 Tu saldo de BTCM es: ${formattedBalance}`, 'success')
      
      // Si el saldo es 0 o muy bajo, intentar minar tokens
      const minBalance = ethers.parseEther('100') // Mínimo de 100 tokens
      if (balance < minBalance) {
        addLogEntry('⛏️ Preparando para minar tokens BTCM...', 'info')
        updateChainStatus(SEPOLIA_CONFIG.id, 'deploying', { progress: 25 })
        
        try {
          // Primero verificar si el usuario tiene el rol ROUTER_ROLE
          const ROUTER_ROLE = await contractInstance.ROUTER_ROLE()
          const hasRouterRole = await contractInstance.hasRole(ROUTER_ROLE, currentAccount)
          
          if (!hasRouterRole) {
            addLogEntry('🔑 Otorgando permisos de minado...', 'info')
            const grantRoleTx = await contractInstance.grantRole(ROUTER_ROLE, currentAccount)
            await grantRoleTx.wait()
            addLogEntry('✅ Permisos otorgados correctamente', 'success')
          }
          
          // Ahora minar tokens
          addLogEntry('⛏️ Minando tokens BTCM...', 'info')
          const mintAmount = ethers.parseEther('1000')
          const tx = await contractInstance.mint(currentAccount, mintAmount)
          
          addLogEntry('⏳ Esperando confirmación de la transacción...', 'info')
          updateChainStatus(SEPOLIA_CONFIG.id, 'deploying', { progress: 75 })
          
          const receipt = await tx.wait()
          const newBalance = await contractInstance.balanceOf(currentAccount)
          const newFormattedBalance = ethers.formatUnits(newBalance, decimals)
          
          addLogEntry(`✅ ¡Tokens minados exitosamente! Nuevo saldo: ${newFormattedBalance} BTCM`, 'success')
          
          if (receipt?.hash) {
            addLogEntry(`📝 Hash de transacción: ${receipt.hash}`, 'info')
            addLogEntry(`🔗 Ver en explorador: ${SEPOLIA_CONFIG.explorerUrl}/tx/${receipt.hash}`, 'info')
            
            // Actualizar el estado con la información del contrato
            updateChainStatus(SEPOLIA_CONFIG.id, 'success', {
              contractAddress: SEPOLIA_CONFIG.contractAddress,
              explorerUrl: `${SEPOLIA_CONFIG.explorerUrl}/address/${SEPOLIA_CONFIG.contractAddress}`,
              txHash: receipt.hash,
              gasUsed: receipt.gasUsed?.toString() || '0',
              deploymentTime: Math.floor(Date.now() / 1000),
              progress: 100
            })
          }
        } catch (mintError: any) {
          addLogEntry(`❌ Error al minar tokens: ${mintError.message}`, 'error')
          updateChainStatus(SEPOLIA_CONFIG.id, 'failed')
          throw mintError
        }
      } else {
        addLogEntry('✅ Ya tienes suficientes tokens BTCM', 'success')
        updateChainStatus(SEPOLIA_CONFIG.id, 'success', {
          contractAddress: SEPOLIA_CONFIG.contractAddress,
          explorerUrl: `${SEPOLIA_CONFIG.explorerUrl}/address/${SEPOLIA_CONFIG.contractAddress}`,
          progress: 100
        })
      }
      
      // Obtener información del token
      const [name, symbol, totalSupply] = await Promise.all([
        contractInstance.name(),
        contractInstance.symbol(),
        contractInstance.totalSupply()
      ])
      
      addLogEntry(`📊 Información del token:
  - Nombre: ${name}
  - Símbolo: ${symbol}
  - Suministro total: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`, 'info')
      
    } catch (error: any) {
      console.error('Error en startDeployment:', error)
      let errorMessage = 'Error al iniciar la interacción con el contrato'
      
      if (error.code === 'UNSUPPORTED_OPERATION') {
        errorMessage = 'Por favor, conecta tu billetera primero'
      } else if (error.code === 4001) {
        errorMessage = 'Transacción rechazada por el usuario'
      } else if (error.code === -32603) {
        errorMessage = 'Error en la red de Ethereum. Por favor, inténtalo de nuevo.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      addLogEntry(`❌ ${errorMessage}`, 'error')
      updateChainStatus(SEPOLIA_CONFIG.id, 'failed')
      throw error
    } finally {
      setIsDeploying(false)
    }
  }, [account, addLogEntry, contract, isDeploying, updateChainStatus, connectWallet])

  // Función auxiliar para generar errores aleatorios (útil para simulación)
  const getRandomError = useCallback((): string => {
    const errors: string[] = [
      'Insufficient gas limit',
      'Network congestion detected',
      'Contract compilation failed',
      'RPC endpoint timeout',
      'Nonce too low',
      'Gas price too low'
    ]
    return errors[Math.floor(Math.random() * errors.length)]
  }, [])

  const stats = useMemo((): DeploymentStats => {
    const successCount = chains.filter((chain: ChainStatus) => chain.status === 'success').length
    const failedCount = chains.filter((chain: ChainStatus) => chain.status === 'failed').length
    const totalGas = chains
      .filter((chain: ChainStatus) => chain.gasUsed)
      .reduce((sum: number, chain: ChainStatus) => {
        return sum + parseInt(chain.gasUsed?.replace(/,/g, '') || '0', 10)
      }, 0)
    
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
    stats,
    addLogEntry,
    updateChainStatus,
    startDeployment,
    resetDeployment
  }
}