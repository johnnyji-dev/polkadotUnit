import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { estimatePendingRewards, fetchRewardsDistributionConfig, fmtAmtFromKSeparator, getDappAddressEnum, hasProperty, removeKSeparator } from '@astar-network/astar-sdk-core';
import { Option, StorageKey, u32, u128, Bytes } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { shibuDappList } from './shibu-dapps';
import { astarDappList } from './astar-dapps';

const newStakeV3 = 'bHkgWQw7eSx1zn2kv5Z9EXMhx7ecS3BmP3dEL6MhrcgodiC';
const swag2 = 'XJK8XsYuVaLH9L4yetkyRtDi1GKJteyRJbWtTmgphMgu5m8';
const testAcnt2 = 'X64MTWdusk3Ey3WdAh5L5ygn1HhYjrUG4a6tuo3jKkCbT7C';
// 0. 14933336 8037635890n

const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

// const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
const provider = new HttpProvider('https://shibuya.public.blastapi.io');
const api = new ApiPromise({ provider });
// await api.isReady;

const getStakerRewards = async (senderAddress) => {

  await api.isReady;
  // *** 0. Account-Ledger info
  const ledger = await getAccountLedger(senderAddress);
  console.log(ledger);
  /*{
    locked: 8000000000000000000n,
    unlocking: [],
    staked: { voting: 0n, buildAndEarn: 0n, era: 0, period: 0, totalStake: 0n },
    stakedFuture: {
      voting: 0n,
      buildAndEarn: 8000000000000000000n,
      era: 4478,
      period: 9,
      totalStake: 8000000000000000000n
    },
    contractStakeCount: 1
  }*/

  console.log('===== ===== ===== ===== =====');

  // *** 1. Determine last claimable era.
  const {
    firstStakedEra,
    lastStakedEra,
    firstSpanIndex,
    lastSpanIndex,
    rewardsExpired,
    eraRewardSpanLength,
    lastStakedPeriod,
  } = await getStakerEraRange(senderAddress);
  console.log(`firstStakedEra : ${firstStakedEra}`);
  console.log(`lastStakedEra : ${lastStakedEra}`);
  console.log(`firstSpanIndex : ${firstSpanIndex}`);
  console.log(`lastSpanIndex : ${lastSpanIndex}`);
  console.log(`rewardsExpired : ${rewardsExpired}`);
  console.log(`eraRewardSpanLength : ${eraRewardSpanLength}`);
  console.log(`lastStakedPeriod : ${lastStakedPeriod}`);

  let result = {
    amount: BigInt(0),
    period: lastStakedPeriod,
    eraCount: 0,
  };

  if (rewardsExpired) {
    return result;
  }
  console.log('===== ===== ===== ===== =====');

  // *** 2. Create list of all claimable eras with stake amounts.
  const claimableEras: Map<number, bigint> = new Map();
  for (let era = firstStakedEra; era <= lastStakedEra; era++) {
    let stakedSum = BigInt(0);

    if (ledger.staked.era <= era) {
      stakedSum += ledger.staked.totalStake;
    }
    if (ledger.stakedFuture && ledger.stakedFuture.era <= era) {
      stakedSum += ledger.stakedFuture.totalStake;
    }

    claimableEras.set(era, stakedSum);
  }
  result.eraCount = claimableEras.size;

  // *** 3. Calculate rewards.
  for (
    let spanIndex = firstSpanIndex;
    spanIndex <= lastSpanIndex;
    spanIndex += eraRewardSpanLength
  ) {
    const span = await getEraRewards(spanIndex);
    if (!span) {
      continue;
    }

    for (let era = span.firstEra; era <= span.lastEra; era++) {
      const staked = claimableEras.get(era);
      if (staked) {
        const eraIndex = era - span.firstEra;
        result.amount +=
          (staked * span.span[eraIndex].stakerRewardPool) / span.span[eraIndex].staked;
      }
    }
  }

  console.log(result);
  console.log('===== ===== ===== ===== =====');

  const resultBonus = await getBonusRewardsAndContractsToClaim(senderAddress);

  console.log(resultBonus);

}
getStakerRewards(newStakeV3).catch(console.error).finally(() => process.exit());

async function getBonusRewardsAndContractsToClaim(
  senderAddress: string
): Promise<{ rewards: bigint; contractsToClaim: string[] }> {
  let result = { rewards: BigInt(0), contractsToClaim: Array<string>() };
  const [stakerInfo, protocolState, constants] = await Promise.all([
    getStakerInfo(senderAddress, true),
    getProtocolState(),
    await getConstants(),
  ]);

  for (const [contract, info] of stakerInfo.entries()) {
    // Staker is eligible to bonus rewards if he is a loyal staker and if rewards are not expired
    // and if stake amount doesn't refer to the past period.
    if (
      info.loyalStaker &&
      protocolState &&
      info.staked.period >=
      protocolState.periodInfo.number - constants.rewardRetentionInPeriods &&
      info.staked.period < protocolState.periodInfo.number
    ) {
      const periodEndInfo = await getPeriodEndInfo(info.staked.period);
      if (periodEndInfo) {
        result.rewards +=
          (info.staked.voting * periodEndInfo.bonusRewardPool) / periodEndInfo.totalVpStake;
        result.contractsToClaim.push(contract);
      } else {
        throw `Period end info not found for period ${info.staked.period}.`;
      }
    }
  }

  return result;
}
async function getStakerInfo(
  address: string,
  includePreviousPeriods = false
): Promise<Map<string, SingularStakingInfo>> {


  await api.isReady;
  const [stakerInfos, protocolState] = await Promise.all([
    api.query.dappStaking.stakerInfo.entries(address),
    getProtocolState(),
  ]);

  return mapsStakerInfo(
    stakerInfos,
    protocolState!.periodInfo.number,
    includePreviousPeriods
  );
}
function mapsStakerInfo(
  stakers: [StorageKey<AnyTuple>, Codec][],
  currentPeriod: number,
  includePreviousPeriods: boolean
): Map<string, SingularStakingInfo> {
  const result = new Map<string, SingularStakingInfo>();
  stakers.forEach(([key, value]) => {
    const v = <Option<PalletDappStakingV3SingularStakingInfo>>value;

    if (v.isSome) {
      const unwrappedValue = v.unwrap();
      const address = getContractAddress(key.args[1] as unknown as SmartContractAddress);

      if (
        address &&
        (unwrappedValue.staked.period.toNumber() === currentPeriod || includePreviousPeriods)
      ) {
        result.set(address, <SingularStakingInfo>{
          loyalStaker: unwrappedValue.loyalStaker.isTrue,
          staked: mapStakeAmount(unwrappedValue.staked),
        });
      }
    }
  });

  console.log('Staker info size: ' + result.size);
  return result;
}
function getContractAddress(address: SmartContractAddress): string | undefined {
  return address.isEvm ? address.asEvm?.toString() : address.asWasm?.toString();
}








async function getEraRewards(spanIndex: number): Promise<EraRewardSpan | undefined> {
  await api.isReady;
  const rewardsWrapped = await api.query.dappStaking.eraRewards<
    Option<PalletDappStakingV3EraRewardSpan>
  >(spanIndex);

  if (rewardsWrapped.isNone) {
    return undefined;
  }

  const rewards = rewardsWrapped.unwrap();
  return {
    firstEra: rewards.firstEra.toNumber(),
    lastEra: rewards.lastEra.toNumber(),
    span: rewards.span.map((reward) => ({
      stakerRewardPool: reward.stakerRewardPool.toBigInt(),
      staked: reward.staked.toBigInt(),
      dappRewardPool: reward.dappRewardPool.toBigInt(),
    })),
  };
}









async function getStakerEraRange(senderAddress: string) {
  const [protocolState, ledger, constants] = await Promise.all([
    getProtocolState(),
    getAccountLedger(senderAddress),
    await getConstants(),
  ]);
  let rewardsExpired = false;

  // *** 1. Determine last claimable era.
  const currentPeriod = protocolState!.periodInfo.number;
  const firstStakedEra = Math.min(
    ledger.staked.era > 0 ? ledger.staked.era : Infinity,
    ledger.stakedFuture?.era ?? Infinity
  );
  const lastStakedPeriod = Math.max(ledger.staked.period, ledger.stakedFuture?.period ?? 0);
  let lastStakedEra = 0;

  if (
    hasRewardsExpired(lastStakedPeriod, currentPeriod, constants.rewardRetentionInPeriods)
  ) {
    // Rewards expired.
    rewardsExpired = true;
  } else if (lastStakedPeriod < currentPeriod) {
    // Find last era from past period.
    const periodInfo = await getPeriodEndInfo(lastStakedPeriod);
    lastStakedEra = periodInfo?.finalEra ?? 0; // periodInfo shouldn't be undefined for this case.
  } else if (lastStakedPeriod === currentPeriod) {
    // Find last era from current period.
    lastStakedEra = protocolState!.era - 1;
  } else {
    throw 'Invalid operation.';
  }

  if (firstStakedEra > lastStakedEra) {
    // No rewards earned. See if we need to distinguish this and rewards expired.
    rewardsExpired = true;
  }

  const firstSpanIndex = firstStakedEra - (firstStakedEra % constants.eraRewardSpanLength);
  const lastSpanIndex = lastStakedEra - (lastStakedEra % constants.eraRewardSpanLength);

  return {
    firstStakedEra,
    lastStakedEra,
    firstSpanIndex,
    lastSpanIndex,
    rewardsExpired,
    eraRewardSpanLength: constants.eraRewardSpanLength,
    lastStakedPeriod,
  };
}
//* @inheritdoc
async function getProtocolState(): Promise<ProtocolState> {
  await api.isReady;

  const state = await api.query.dappStaking.activeProtocolState<PalletDappStakingV3ProtocolState>();

  return mapToModel(state);
}
function mapToModel(state: PalletDappStakingV3ProtocolState): ProtocolState {
  return {
    era: state.era.toNumber(),
    nextEraStart: state.nextEraStart.toNumber(),
    periodInfo: {
      number: state.periodInfo.number.toNumber(),
      subperiod: <PeriodType>state.periodInfo.subperiod.type,
      nextSubperiodStartEra: state.periodInfo.nextSubperiodStartEra.toNumber(),
    },
    maintenance: state.maintenance.isTrue,
  };
}
async function getConstants(): Promise<Constants> {
  await api.isReady;

  return {
    eraRewardSpanLength: (<u32>api.consts.dappStaking.eraRewardSpanLength).toNumber(),
    rewardRetentionInPeriods: (<u32>api.consts.dappStaking.rewardRetentionInPeriods).toNumber(),
    minStakeAmount: (<u128>api.consts.dappStaking.minimumStakeAmount).toBigInt(),
    minBalanceAfterStaking: 10,
    maxNumberOfStakedContracts: (<u32>(
      api.consts.dappStaking.maxNumberOfStakedContracts
    )).toNumber(),
    maxNumberOfContracts: (<u32>api.consts.dappStaking.maxNumberOfContracts).toNumber(),
    maxUnlockingChunks: (<u32>api.consts.dappStaking.maxUnlockingChunks).toNumber(),
    unlockingPeriod: (<u32>api.consts.dappStaking.unlockingPeriod).toNumber(),
  };
}
function hasRewardsExpired(
  stakedPeriod: number,
  currentPeriod: number,
  rewardRetentionInPeriods: number
): boolean {
  return stakedPeriod < currentPeriod - rewardRetentionInPeriods;
}
async function getPeriodEndInfo(period: number): Promise<PeriodEndInfo | undefined> {
  await api.isReady;
  const infoWrapped = await api.query.dappStaking.periodEnd<
    Option<PalletDappStakingV3PeriodEndInfo>
  >(period);

  if (infoWrapped.isNone) {
    return undefined;
  }

  const info = infoWrapped.unwrap();
  return {
    bonusRewardPool: info.bonusRewardPool.toBigInt(),
    totalVpStake: info.totalVpStake.toBigInt(),
    finalEra: info.finalEra.toNumber(),
  };
}

// { stakerApr: 313.1920447916816 }












async function getAccountLedger(address: string): Promise<AccountLedger> {
  await api.isReady;

  const ledger = await api.query.dappStaking.ledger<PalletDappStakingV3AccountLedger>(address);

  return mapLedger(ledger);
}
function mapLedger(ledger: PalletDappStakingV3AccountLedger): AccountLedger {
  return <AccountLedger>{
    locked: ledger.locked.toBigInt(),
    unlocking: ledger.unlocking.map((chunk) => ({
      amount: chunk.amount.toBigInt(),
      unlockBlock: chunk.unlockBlock.toBigInt(),
    })),
    staked: mapStakeAmount(ledger.staked),
    stakedFuture: ledger.stakedFuture.isSome
      ? mapStakeAmount(ledger.stakedFuture.unwrap())
      : undefined,
    contractStakeCount: ledger.contractStakeCount.toNumber(),
  };
}
function mapStakeAmount(dapp: PalletDappStakingV3StakeAmount): StakeAmount {
  return {
    voting: dapp.voting.toBigInt(),
    buildAndEarn: dapp.buildAndEarn.toBigInt(),
    era: dapp.era.toNumber(),
    period: dapp.period.toNumber(),
    totalStake: dapp.voting.toBigInt() + dapp.buildAndEarn.toBigInt(),
  };
}