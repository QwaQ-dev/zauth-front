// import { initSDK, createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";

// const init = async () => {
//   await initSDK(); // Load FHE
//   return createInstance(SepoliaConfig);
// };

// // Шифрование данных для отправки в контракт
// export async function encryptSocialMediaData(
//   socialMediaIds: number[],
//   contractAddress: string,
// ): Promise<{
//   // encryptedValue: Uint8Array
//   proof: Uint8Array
// }> {
//   try {
//     init().then((instance) => {
//       console.log(instance);
//     });
//     // Создаем битовую маску из ID социальных сетей
//     const bitMask = socialMediaIds.reduce((mask, id) => mask | (1 << (id - 1)), 0)
//     console.log("[v0] Created bit mask:", bitMask, "from social media IDs:", socialMediaIds)

//     // Шифруем битовую маску
//     console.log("[v0] Encrypting bit mask...")
//     // const encrypted = instance.encrypt256(bitMask)

//     console.log("[v0] Data encrypted successfully")
//     return {
//       // encryptedValue: encrypted,
//       proof: new Uint8Array(), // Proof генерируется автоматически в fhevmjs
//     }
//   } catch (error) {
//     console.error("[v0] Failed to encrypt social media data:", error)
//     throw error
//   }
// }

// // Расшифровка данных из контракта (для чтения)
// export async function decryptSocialMediaData(
//   encryptedData: string,
//   contractAddress: string,
//   userAddress: string,
//   signer: any,
// ): Promise<number> {
//   try {
//     const instance = await initializeFHE()

//     // Генерируем ключевую пару для расшифровки
//     console.log("[v0] Generating keypair for decryption...")
//     const { publicKey, privateKey } = instance.generateKeypair()

//     // Создаем EIP-712 подпись
//     console.log("[v0] Creating EIP-712 signature...")
//     const eip712 = instance.createEIP712(publicKey, contractAddress)
//     const signature = await signer._signTypedData(eip712.domain, eip712.types, eip712.message)

//     // Расшифровываем данные
//     console.log("[v0] Decrypting data...")
//     const decryptedValue = await instance.reencrypt(
//       encryptedData,
//       privateKey,
//       publicKey,
//       signature,
//       contractAddress,
//       userAddress,
//     )

//     console.log("[v0] Data decrypted successfully:", decryptedValue)
//     return Number.parseInt(decryptedValue)
//   } catch (error) {
//     console.error("[v0] Failed to decrypt social media data:", error)
//     throw error
//   }
// }

