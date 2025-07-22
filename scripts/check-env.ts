import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { JsonRpcProvider, Wallet, formatEther } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Lista de variables de entorno requeridas
const requiredEnvVars = [
  'PRIVATE_KEY',
  'SEPOLIA_RPC_URL',
  'BSC_TESTNET_RPC_URL',
  'BASE_SEPOLIA_RPC_URL',
  'ETHERSCAN_API_KEY',
  'BSCSCAN_API_KEY',
  'BASESCAN_API_KEY',
  'LZ_ENDPOINT_SEPOLIA',
  'LZ_ENDPOINT_BSC_TESTNET',
  'LZ_ENDPOINT_BASE_SEPOLIA'
];

// Verificar variables de entorno
function checkEnvVars() {
  console.log('🔍 Verificando variables de entorno...');
  console.log('='.repeat(60));
  
  let allVarsPresent = true;
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variable de entorno faltante: ${envVar}`);
      allVarsPresent = false;
    } else {
      console.log(`✅ ${envVar}: ${envVar.includes('PRIVATE_KEY') ? '***MASKED***' : process.env[envVar]}`);
    }
  }
  
  // Verificar formato de la clave privada
  if (process.env.PRIVATE_KEY) {
    try {
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
      console.log('✅ Formato de clave privada válido');
      console.log(`   Dirección: ${wallet.address}`);
    } catch (error) {
      console.error('❌ Formato de clave privada inválido');
      allVarsPresent = false;
    }
  }
  
  console.log('='.repeat(60));
  
  if (allVarsPresent) {
    console.log('✅ Todas las variables de entorno están configuradas correctamente');
  } else {
    console.error('❌ Faltan algunas variables de entorno requeridas');
    process.exit(1);
  }
}

// Verificar conexión a redes
async function checkNetworkConnections() {
  console.log('\n🌐 Verificando conexiones a redes...');
  console.log('='.repeat(60));
  
  const networks = [
    { name: 'Ethereum Sepolia', url: process.env.SEPOLIA_RPC_URL },
    { name: 'BNB Chain Testnet', url: process.env.BSC_TESTNET_RPC_URL },
    { name: 'Base Sepolia', url: process.env.BASE_SEPOLIA_RPC_URL }
  ];
  
  for (const network of networks) {
    try {
      const provider = new JsonRpcProvider(network.url);
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ ${network.name}: Conectado (Bloque #${blockNumber})`);
    } catch (error: any) {
      console.error(`❌ ${network.name}: Error de conexión - ${error.message}`);
    }
  }
  
  console.log('='.repeat(60));
}

// Verificar saldos en las redes
async function checkBalances() {
  if (!process.env.PRIVATE_KEY) return;
  
  console.log('\n💰 Verificando saldos...');
  console.log('='.repeat(60));
  
  const networks = [
    { name: 'Ethereum Sepolia', url: process.env.SEPOLIA_RPC_URL, symbol: 'ETH' },
    { name: 'BNB Chain Testnet', url: process.env.BSC_TESTNET_RPC_URL, symbol: 'BNB' },
    { name: 'Base Sepolia', url: process.env.BASE_SEPOLIA_RPC_URL, symbol: 'ETH' }
  ];
  
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  
  for (const network of networks) {
    try {
      const provider = new JsonRpcProvider(network.url);
      const balance = await provider.getBalance(wallet.address);
      const formattedBalance = formatEther(balance);
      console.log(`💰 ${network.name}: ${formattedBalance} ${network.symbol}`);
      
      // Advertencia si el saldo es bajo
      if (parseFloat(formattedBalance) < 0.05) {
        console.warn(`   ⚠️  Saldo bajo en ${network.name}. Se recomienda fondear la cuenta.`);
      }
    } catch (error: any) {
      console.error(`❌ Error al verificar saldo en ${network.name}: ${error.message}`);
    }
  }
  
  console.log('='.repeat(60));
}

// Función principal
async function main() {
  console.log('🔧 Verificación de configuración de despliegue');
  console.log('='.repeat(60));
  
  // Verificar variables de entorno
  checkEnvVars();
  
  // Verificar conexiones a redes
  await checkNetworkConnections();
  
  // Verificar saldos
  await checkBalances();
  
  console.log('\n✅ Verificación completada. El entorno está listo para el despliegue.');
}

main().catch((error) => {
  console.error('❌ Error durante la verificación:', error);
  process.exit(1);
});
