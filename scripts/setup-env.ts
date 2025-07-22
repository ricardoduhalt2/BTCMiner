import * as fs from 'fs';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const rl = readline.createInterface({ input, output });

async function main() {
  console.log('🛠️  Configuración del entorno de desarrollo');
  console.log('='.repeat(60));
  
  // Verificar si .env ya existe
  if (fs.existsSync('.env')) {
    const overwrite = await rl.question('⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('Operación cancelada.');
      await rl.close();
      return;
    }
  }

  // Obtener información del usuario
  console.log('\n🔑 Ingresa la siguiente información:');
  
  const privateKey = await rl.question('1. Clave privada (sin el prefijo 0x): ');
  const infuraKey = await rl.question('2. Clave de API de Infura (para Sepolia): ');
  const etherscanKey = await rl.question('3. Clave de API de Etherscan: ');
  const bscscanKey = await rl.question('4. Clave de API de BscScan: ');
  const basescanKey = await rl.question('5. Clave de API de BaseScan: ');

  // Crear contenido del archivo .env
  const envContent = `# Private key for deployment (without 0x prefix)
PRIVATE_KEY=${privateKey}

# RPC URLs for different networks
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/${infuraKey}
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# API Keys for contract verification
ETHERSCAN_API_KEY=${etherscanKey}
BSCSCAN_API_KEY=${bscscanKey}
BASESCAN_API_KEY=${basescanKey}

# Gas reporting
REPORT_GAS=true

# LayerZero Endpoint Addresses (Testnet)
LZ_ENDPOINT_SEPOLIA=0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1
LZ_ENDPOINT_BSC_TESTNET=0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1
LZ_ENDPOINT_BASE_SEPOLIA=0x6EDCE65403992e310A62460808c4b910D972f10f
`;

  // Escribir el archivo .env
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Archivo .env creado exitosamente!');
  
  // Verificar la configuración
  console.log('\n🔍 Verificando configuración...');
  try {
    await execAsync('npx ts-node scripts/check-env.ts');
  } catch (error: any) {
    console.error('❌ Error al verificar la configuración:', error.message);
  }

  await rl.close();
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
