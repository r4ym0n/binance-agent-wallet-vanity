export const CONTRACT_ADDRESS =
  "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

export const TLD = ".ai";

export const BINANCE_WALLET_URL = "https://www.binance.com/zh-CN/web3wallet";

export const BSCSCAN_TOKEN_URL = `https://bscscan.com/token/${CONTRACT_ADDRESS}`;

export const BSCSCAN_ADDRESS_URL = (addr: string) =>
  `https://bscscan.com/address/${addr}`;

export const BSCSCAN_TX_URL = (tx: string) => `https://bscscan.com/tx/${tx}`;

export const GITHUB_URL = "https://github.com/r4ym0n/binance-agent-wallet-vanity";

export const NAME_PATTERN = /^[a-z0-9-]{1,32}$/;
