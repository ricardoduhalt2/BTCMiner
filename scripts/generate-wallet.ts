import { Wallet } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Cargar variables de entorno
config();

// Función para generar una nueva billetera
function generateWallet() {
  // Generar una nueva billetera aleatoria
  const wallet = Wallet.createRandom();
  
  // Mostrar información de la billetera
  console.log('\n🔑 Billetera generada con éxito');
  console.log('='.repeat(60));
  console.log(`Dirección:     ${wallet.address}`);
  console.log(`Clave privada: ${wallet.privateKey}`);
  console.log('\n⚠️  ¡IMPORTANTE! Guarda esta información en un lugar seguro.');
  console.log('Nunca compartas tu clave privada con nadie.');
  console.log('='.repeat(60));
  
  // Crear directorio de seguridad si no existe
  const secureDir = path.join(__dirname, '..', 'secure');
  if (!fs.existsSync(secureDir)) {
    fs.mkdirSync(secureDir, { recursive: true });
  }
  
  // Guardar la información en un archivo seguro (ignorado por git)
  const walletInfo = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
    timestamp: new Date().toISOString()
  };
  
  const walletFile = path.join(secureDir, 'wallet.json');
  fs.writeFileSync(walletFile, JSON.stringify(walletInfo, null, 2));
  console.log(`\n✅ Información de la billetera guardada en: ${walletFile}`);
  
  return wallet;
}

// Función para actualizar el archivo .env con la clave privada
function updateEnvFile(privateKey: string) {
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  // Leer el archivo .env si existe
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Actualizar la PRIVATE_KEY si ya existe
    if (envContent.includes('PRIVATE_KEY=')) {
      envContent = envContent.replace(
        /PRIVATE_KEY=.*/,
        `PRIVATE_KEY=${privateKey}`
      );
    } else {
      // Si no existe, agregarla al principio
      envContent = `PRIVATE_KEY=${privateKey}\n${envContent}`;
    }
  } else {
    // Si el archivo no existe, crearlo
    envContent = `# Private key for deployment (without 0x prefix)
PRIVATE_KEY=${privateKey}
`;
  }
  
  // Escribir el archivo .env
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Archivo .env actualizado con la nueva clave privada');
}

// Función para mostrar instrucciones de fondos de prueba
function showFaucetInstructions(address: string) {
  console.log('\n💰 Instrucciones para obtener fondos de prueba:');
  console.log('='.repeat(60));
  
  console.log('\n1. Ethereum Sepolia Testnet:');
  console.log(`   - Dirección: ${address}`);
  console.log('   - Faucet: https://sepoliafaucet.com/');
  console.log('   - Cantidad mínima recomendada: 0.1 ETH');
  
  console.log('\n2. BNB Chain Testnet:');
  console.log(`   - Dirección: ${address}`);
  console.log('   - Faucet: https://testnet.bnbchain.org/faucet-smart');
  console.log('   - Cantidad mínima recomendada: 1 BNB');
  
  console.log('\n3. Base Sepolia Testnet:');
  console.log(`   - Dirección: ${address}`);
  console.log('   - Faucet: https://www.base.org/faucet');
  console.log('   - Cantidad mínima recomendada: 0.1 ETH');
  
  console.log('\n🔍 Después de obtener fondos, verifica los saldos con:');
  console.log('   npx ts-node scripts/check-env.ts');
  console.log('='.repeat(60));
}

// Función principal
async function main() {
  console.log('\n🛠️  Generador de billetera para desarrollo');
  console.log('='.repeat(60));
  
  // Configurar readline
  const rl = readline.createInterface({ input, output });
  
  // Verificar si ya existe una billetera
  const walletFile = path.join(__dirname, '..', 'secure', 'wallet.json');
  let wallet;
  
  if (fs.existsSync(walletFile)) {
    console.log('\n⚠️  Ya existe una billetera generada previamente.');
    const answer = await rl.question('¿Deseas usar la billetera existente? (s/n): ');
    
    if (answer.toLowerCase() === 's') {
      const walletInfo = JSON.parse(fs.readFileSync(walletFile, 'utf-8'));
      console.log(`\n🔑 Usando billetera existente: ${walletInfo.address}`);
      wallet = new Wallet(walletInfo.privateKey);
    } else {
      wallet = generateWallet();
    }
  } else {
    wallet = generateWallet();
  }
  
  // Cerrar readline
  await rl.close();
  
  // Actualizar el archivo .env con la clave privada
  updateEnvFile(wallet.privateKey);
  
  // Mostrar instrucciones para obtener fondos
  showFaucetInstructions(wallet.address);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
