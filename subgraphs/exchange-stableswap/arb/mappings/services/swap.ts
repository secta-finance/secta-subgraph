/* eslint-disable prefer-const */
import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Bundle, Pair, Swap, Token, Transaction } from "../../generated/schema";
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, convertTokenToDecimal } from "../utils";
import { getTrackedFeeVolumeUSD, getTrackedVolumeUSD } from "../utils/pricing";
import { getOrCreateFactory } from "../utils/data";
import { updatePairDayData, updatePairHourData, updatePancakeDayData, updateTokenDayData } from "./dayUpdates";

export class SwapParams {
  amount0In: BigInt;
  amount1In: BigInt;
  amount0Out: BigInt;
  amount1Out: BigInt;
  sender: Bytes;
  to: Bytes;
}

export function swap(event: ethereum.Event, params: SwapParams): void {
  let pair = Pair.load(event.address.toHex());
  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);
  let amount0In = convertTokenToDecimal(params.amount0In, token0.decimals);
  let amount1In = convertTokenToDecimal(params.amount1In, token1.decimals);
  let amount0Out = convertTokenToDecimal(params.amount0Out, token0.decimals);
  let amount1Out = convertTokenToDecimal(params.amount1Out, token1.decimals);

  // totals for volume updates
  let amount0Total = amount0Out.plus(amount0In);
  let amount1Total = amount1Out.plus(amount1In);

  // BNB/USD prices
  let bundle = Bundle.load("1");

  let derivedToken0AmountBNB = token0.derivedETH.times(amount0Total);
  let derivedToken1AmountBNB = token1.derivedETH.times(amount1Total);

  // get total amounts of derived USD and BNB for tracking
  let derivedAmountBNB = derivedToken1AmountBNB.plus(derivedToken0AmountBNB).div(BigDecimal.fromString("2"));
  let derivedAmountUSD = derivedAmountBNB.times(bundle.ethPrice);

  // get swap fee amount of derived USD and BNB for tracking
  let derivedFeeAmountBNB: BigDecimal;
  if (
    derivedToken0AmountBNB.equals(BigDecimal.fromString("0")) ||
    derivedToken1AmountBNB.equals(BigDecimal.fromString("0"))
  ) {
    derivedFeeAmountBNB = BIG_DECIMAL_ZERO;
  } else if (derivedToken0AmountBNB.ge(derivedToken1AmountBNB)) {
    derivedFeeAmountBNB = derivedToken0AmountBNB.minus(derivedToken1AmountBNB);
  } else {
    derivedFeeAmountBNB = derivedToken1AmountBNB.minus(derivedToken0AmountBNB);
  }
  let derivedFeeAmountUSD = derivedFeeAmountBNB.times(bundle.ethPrice);

  // only accounts for volume through white listed tokens
  let trackedAmountUSD = getTrackedVolumeUSD(
    bundle as Bundle,
    amount0Total,
    token0 as Token,
    amount1Total,
    token1 as Token
  );
  let trackedFeeAmountUSD = getTrackedFeeVolumeUSD(
    bundle as Bundle,
    amount0Total,
    token0 as Token,
    amount1Total,
    token1 as Token
  );

  let price0 = token0.derivedETH.times(bundle.ethPrice);
  let price1 = token1.derivedETH.times(bundle.ethPrice);

  let trackedAmountBNB: BigDecimal;
  if (bundle.ethPrice.equals(BIG_DECIMAL_ZERO)) {
    trackedAmountBNB = BIG_DECIMAL_ZERO;
  } else {
    trackedAmountBNB = trackedAmountUSD.div(bundle.ethPrice);
  }

  // update token0 global volume and token liquidity stats
  token0.tradeVolume = token0.tradeVolume.plus(amount0In.plus(amount0Out));
  token0.tradeVolumeUSD = token0.tradeVolumeUSD.plus(trackedAmountUSD);
  token0.untrackedVolumeUSD = token0.untrackedVolumeUSD.plus(derivedAmountUSD);

  // update token1 global volume and token liquidity stats
  token1.tradeVolume = token1.tradeVolume.plus(amount1In.plus(amount1Out));
  token1.tradeVolumeUSD = token1.tradeVolumeUSD.plus(trackedAmountUSD);
  token1.untrackedVolumeUSD = token1.untrackedVolumeUSD.plus(derivedAmountUSD);

  // update txn counts
  token0.totalTransactions = token0.totalTransactions.plus(BIG_INT_ONE);
  token1.totalTransactions = token1.totalTransactions.plus(BIG_INT_ONE);

  // update pair volume data, use tracked amount if we have it as its probably more accurate
  pair.volumeUSD = pair.volumeUSD.plus(trackedAmountUSD);
  pair.volumeOutUSD = pair.volumeOutUSD.plus(amount0Out.times(price0)).plus(amount1Out.times(price1));
  pair.volumeToken0 = pair.volumeToken0.plus(amount0Total);
  pair.volumeToken1 = pair.volumeToken1.plus(amount1Total);
  pair.untrackedVolumeUSD = pair.untrackedVolumeUSD.plus(derivedAmountUSD);
  pair.totalTransactions = pair.totalTransactions.plus(BIG_INT_ONE);
  pair.save();

  // update global values, only used tracked amounts for volume
  let factory = getOrCreateFactory(pair.factory);
  factory.totalVolumeUSD = factory.totalVolumeUSD.plus(trackedAmountUSD);
  factory.totalVolumeETH = factory.totalVolumeETH.plus(trackedAmountBNB);
  factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(derivedAmountUSD);
  factory.totalTransactions = factory.totalTransactions.plus(BIG_INT_ONE);

  // save entities
  pair.save();
  token0.save();
  token1.save();
  factory.save();

  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.block = event.block.number;
    transaction.timestamp = event.block.timestamp;
    transaction.mints = [];
    transaction.swaps = [];
    transaction.burns = [];
  }
  let swaps = transaction.swaps;
  let swap = new Swap(event.transaction.hash.toHex().concat("-").concat(BigInt.fromI32(swaps.length).toString()));

  // update swap event
  swap.transaction = transaction.id;
  swap.pair = pair.id;
  swap.timestamp = transaction.timestamp;
  swap.transaction = transaction.id;
  swap.sender = params.sender;
  swap.amount0In = amount0In;
  swap.amount1In = amount1In;
  swap.amount0Out = amount0Out;
  swap.amount1Out = amount1Out;
  swap.to = params.to;
  swap.from = event.transaction.from;
  swap.logIndex = event.logIndex;
  // use the tracked amount if we have it
  swap.amountUSD = trackedAmountUSD === BIG_DECIMAL_ZERO ? derivedAmountUSD : trackedAmountUSD;
  swap.amountFeeUSD = trackedFeeAmountUSD === BIG_DECIMAL_ZERO ? derivedFeeAmountUSD : trackedFeeAmountUSD;
  swap.save();

  // update the transaction

  // TODO: Consider using .concat() for handling array updates to protect
  // against unintended side effects for other code paths.
  swaps.push(swap.id);
  transaction.swaps = swaps;
  transaction.save();

  // update day entities
  let pairDayData = updatePairDayData(event);
  let pairHourData = updatePairHourData(event);
  let pancakeDayData = updatePancakeDayData(event);
  let token0DayData = updateTokenDayData(token0 as Token, event);
  let token1DayData = updateTokenDayData(token1 as Token, event);

  // swap specific updating
  pancakeDayData.dailyVolumeUSD = pancakeDayData.dailyVolumeUSD.plus(trackedAmountUSD);
  pancakeDayData.dailyVolumeETH = pancakeDayData.dailyVolumeETH.plus(trackedAmountBNB);
  pancakeDayData.dailyVolumeUntracked = pancakeDayData.dailyVolumeUntracked.plus(derivedAmountUSD);
  pancakeDayData.save();

  // swap specific updating for pair
  pairDayData.dailyVolumeToken0 = pairDayData.dailyVolumeToken0.plus(amount0Total);
  pairDayData.dailyVolumeToken1 = pairDayData.dailyVolumeToken1.plus(amount1Total);
  pairDayData.dailyVolumeUSD = pairDayData.dailyVolumeUSD.plus(trackedAmountUSD);
  pairDayData.save();

  // update hourly pair data
  pairHourData.hourlyVolumeToken0 = pairHourData.hourlyVolumeToken0.plus(amount0Total);
  pairHourData.hourlyVolumeToken1 = pairHourData.hourlyVolumeToken1.plus(amount1Total);
  pairHourData.hourlyVolumeUSD = pairHourData.hourlyVolumeUSD.plus(trackedAmountUSD);
  pairHourData.save();

  // swap specific updating for token0
  token0DayData.dailyVolumeToken = token0DayData.dailyVolumeToken.plus(amount0Total);
  token0DayData.dailyVolumeETH = token0DayData.dailyVolumeETH.plus(amount0Total.times(token0.derivedETH as BigDecimal));
  token0DayData.dailyVolumeUSD = token0DayData.dailyVolumeUSD.plus(
    amount0Total.times(token0.derivedETH as BigDecimal).times(bundle.ethPrice)
  );
  token0DayData.save();

  // swap specific updating
  token1DayData.dailyVolumeToken = token1DayData.dailyVolumeToken.plus(amount1Total);
  token1DayData.dailyVolumeETH = token1DayData.dailyVolumeETH.plus(amount1Total.times(token1.derivedETH as BigDecimal));
  token1DayData.dailyVolumeUSD = token1DayData.dailyVolumeUSD.plus(
    amount1Total.times(token1.derivedETH as BigDecimal).times(bundle.ethPrice)
  );
  token1DayData.save();
}
