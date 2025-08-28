import { createConfig, http } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected({ shimDisconnect: true }), // MetaMask / OKX / Trust и т.п.
  ],
  transports: {
    [mainnet.id]: http(), // публичные RPC по умолчанию
  },
})
