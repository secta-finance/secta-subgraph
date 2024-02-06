const WETH = "0x2c1b868d6596a18e32e61b901e4060c872647b6c";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea-goerli",
  wNativeAddress: WETH,
  v3: {
    // TODO: update this, use old pool for now
    // WETH-USDT 500
    wNativeStablePoolAddress: "0x58B172f9AD87d6cd3614811FBfcb492f7e1271ec",
    stableIsToken0: true,
    factoryAddress: "0x591F72F4a2d2C2678B709a38E7ff0a1c86099a8d",
    startBlock: 3423645,
    stableCoins: [
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    whitelistAddresses: [
      WETH,
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    nonfungiblePositionManagerAddress: "0xEA658F4e0B575c5DC9420dE44baB842374FDa258",
    nonfungiblePositionManagerStartBlock: 3423645,
    minETHLocked: 0,
  },
  // secta: ignore v2
  v2: {
    factoryAddress: "0xb6fafd4adbcd21cf665909767e0ed0d05709abfb",
    startBlock: 703863,
    wNativeStablePair0: "0x947435ac2c2b4f6d025acaffac2db410bf874aed",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0xf56dc6695cf1f5c364edebc7dc7077ac9b586068", // USDC
    ],
    minETHLocked: 0,
  },
};
