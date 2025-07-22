import { ethers } from 'ethers';

// Configuración de redes
const NETWORKS = [
  {
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://eth-sepolia.public.blastapi.io', // Proveedor RPC alternativo
    symbol: 'ETH',
    chainId: 11155111,
    explorerUrl: 'https://sepolia.etherscan.io/address/'
  },
  {
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'https://bsc-testnet.publicnode.com', // Proveedor RPC alternativo
    symbol: 'BNB',
    chainId: 97,
    explorerUrl: 'https://testnet.bscscan.com/address/'
  },
  {
    name: 'Base Sepolia',
    rpcUrl: 'https://base-sepolia.publicnode.com', // Proveedor RPC alternativo
    symbol: 'ETH',
    chainId: 84532,
    explorerUrl: 'https://sepolia.basescan.org/address/'
  }
];

// Dirección a verificar (extraída del archivo .env o generada anteriormente)
const ADDRESS = '0xB4784dc9c060BB06Ac1aF0C231f3638fEa5CB8Df';

async function checkBalances() {
  console.log('🔍 Verificando saldos...');
  console.log('='.repeat(60));
  
  for (const network of NETWORKS) {
    try {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl, {
        name: network.name,
        chainId: network.chainId
      });
      
      const balance = await provider.getBalance(ADDRESS);
      const balanceInEth = ethers.formatEther(balance);
      
      console.log(`\n🌐 ${network.name}`);
      console.log('─'.repeat(60));
      console.log(`Dirección: ${ADDRESS}`);
      console.log(`Saldo: ${balanceInEth} ${network.symbol}`);
      console.log(`Explorador: ${network.explorerUrl}${ADDRESS}`);
      console.log(`RPC: ${network.rpcUrl}`);
      
      // Mostrar transacciones recientes
      try {
        const blockNumber = await provider.getBlockNumber();
        console.log(`Último bloque: ${blockNumber}`);
        
        // Verificar si la cuenta ha realizado alguna transacción
        const txCount = await provider.getTransactionCount(ADDRESS);
        console.log(`Número de transacciones: ${txCount}`);
        
        if (txCount > 0) {
          console.log('✅ La cuenta ha realizado transacciones en esta red');
        } else {
          console.log('ℹ️  No se encontraron transacciones para esta cuenta');
        }
      } catch (txError: any) {
        console.log('⚠️  No se pudieron verificar las transacciones:', txError.message);
      }
      
    } catch (error: any) {
      console.error(`\n❌ Error al conectar con ${network.name}:`);
      console.error(`   ${error.message}`);
      console.error(`   RPC: ${network.rpcUrl}`);
    }
  }
  
  console.log('\n='.repeat(60));
  console.log('💡 Si necesitas fondos de prueba, puedes obtenerlos en:');
  console.log('   - Sepolia: https://sepoliafaucet.com/');
  console.log('   - BSC Testnet: https://testnet.binance.org/faucet-smart');
  console.log('   - Base Sepolia: https://www.base.org/faucet');
  console.log('='.repeat(60));
}

checkBalances().catch(console.error);
