const WETH = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea-mainnet",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0xe331A3A42Fd83A7f44dAeDC7bA212bDeB90Ecf7B",
    stableIsToken0: true,
    factoryAddress: "0x9BD425a416A276C72a13c13bBd8145272680Cf07",
    startBlock: 2390738,
    stableCoins: [
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    whitelistAddresses: [
      WETH,
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    nonfungiblePositionManagerAddress: "0x400F9ce4E9baD12501De831970C13e4aE99AC442",
    nonfungiblePositionManagerStartBlock: 2389296,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x8Ad39bf99765E24012A28bEb0d444DE612903C43",
    startBlock: 2388856,
    wNativeStablePair0: "0xEcDbB2dA6BA86C84f364EBbd068561C8f383fE27",
    wNativeStablePair1: "0x0000000000000000000000000000000000000000",
    whitelistAddresses: [
      WETH,
      "0x176211869ca2b568f2a7d4ee941e073a821ee1ff", // USDC
      "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4", // WBTC
      "0xa219439258ca9da29e9cc4ce5596924745e12b93", // USDT
      "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5", // DAI
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // BUSD
    ],
    minETHLocked: 0,
  },
};
