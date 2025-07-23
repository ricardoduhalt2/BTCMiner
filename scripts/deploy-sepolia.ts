import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Configuración de despliegue
const CONFIG = {
  TOKEN_NAME: "BTCMiner",
  TOKEN_SYMBOL: "BTCM",
  LAYERZERO_ENDPOINT: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1" // Sepolia
};

async function main() {
  console.log("🚀 Iniciando despliegue en Sepolia");
  console.log("==================================");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log(`🔗 Red: ${network.name} (ID: ${network.chainId})`);
  console.log(`👤 Desplegador: ${deployer.address}`);
  console.log(`💰 Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  
  // 1. Desplegar BTCMiner
  console.log("\n📦 Desplegando contrato BTCMiner...");
  const BTCMiner = await ethers.getContractFactory("BTCMiner");
  const btcMiner = await BTCMiner.deploy(
    CONFIG.LAYERZERO_ENDPOINT,
    CONFIG.TOKEN_NAME,
    CONFIG.TOKEN_SYMBOL
  );
  
  await btcMiner.waitForDeployment();
  const contractAddress = await btcMiner.getAddress();
  
  console.log(`✅ Contrato BTCMiner desplegado en: ${contractAddress}`);
  console.log(`🔗 Ver en explorador: https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Guardar información del despliegue
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractName: "BTCMiner",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: btcMiner.deploymentTransaction()?.hash || ""
  };
  
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `deployment-${network.name}-${Date.now()}.json`);
  
  // Función para manejar la serialización de BigInt
  const replacer = (key: string, value: any) => 
    typeof value === 'bigint' ? value.toString() : value;
  
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, replacer, 2));
  
  console.log(`\n📝 Información de despliegue guardada en: ${deploymentFile}`);
  
  // Configuración inicial del contrato
  console.log("\n⚙️ Configurando roles iniciales...");
  
  // Otorgar roles al desplegador
  const ADMIN_ROLE = await btcMiner.ADMIN_ROLE();
  const PAUSER_ROLE = await btcMiner.PAUSER_ROLE();
  
  const tx1 = await btcMiner.grantRole(ADMIN_ROLE, deployer.address);
  await tx1.wait();
  
  const tx2 = await btcMiner.grantRole(PAUSER_ROLE, deployer.address);
  await tx2.wait();
  
  console.log("✅ Roles configurados correctamente");
  console.log(`   - Desplegador (${deployer.address}) ahora es ADMIN y PAUSER`);
  
  // Verificar el contrato en Etherscan
  console.log("\n🔍 Verificando contrato en Etherscan...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        CONFIG.LAYERZERO_ENDPOINT,
        CONFIG.TOKEN_NAME,
        CONFIG.TOKEN_SYMBOL
      ]
    });
    console.log("✅ Contrato verificado en Etherscan");
  } catch (error) {
    console.warn("⚠️ No se pudo verificar el contrato automáticamente");
    console.warn("   Puedes verificarlo manualmente con el comando:");
    console.log(`   npx hardhat verify --network sepolia ${contractAddress} ${CONFIG.LAYERZERO_ENDPOINT} "${CONFIG.TOKEN_NAME}" "${CONFIG.TOKEN_SYMBOL}"`);
  }
  
  console.log("\n✨ Despliegue completado exitosamente! ✨");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });
