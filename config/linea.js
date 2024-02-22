const WETH = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";

/**
 * @type import('./config').NetworkConfig
 */
module.exports = {
  network: "linea",
  wNativeAddress: WETH,
  v3: {
    // WETH-USDC 500
    wNativeStablePoolAddress: "0xe331a3a42fd83a7f44daedc7ba212bdeb90ecf7b",
    stableIsToken0: true,
    factoryAddress: "0x9bd425a416a276c72a13c13bbd8145272680cf07",
    startBlock: 2389290,
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
    nonfungiblePositionManagerAddress: "0x400f9ce4e9bad12501de831970c13e4ae99ac442",
    nonfungiblePositionManagerStartBlock: 2389296,
    minETHLocked: 0,
  },
  v2: {
    factoryAddress: "0x8ad39bf99765e24012a28beb0d444de612903c43",
    startBlock: 2388856,
    wNativeStablePair0: "0xecdbb2da6ba86c84f364ebbd068561c8f383fe27",
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
