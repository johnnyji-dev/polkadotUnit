import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { Bytes, Compact, Enum, Struct, bool, u128, u32 } from '@polkadot/types';
import { BN, u8aToNumber } from '@polkadot/util';
import { Perquintill } from '@polkadot/types/interfaces';
import { ethers } from 'ethers';
import bigInt from 'big-integer';

// const getApr = async (): Promise<{ stakerApr: number; bonusApr: number }> => {
const getApr = async () => {
  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;
  try {
    const getNumber = (bytes: Bytes): number => u8aToNumber(bytes.toU8a().slice(1, 4));

    const [erasPerBuildAndEarn, erasPerVoting, eraLength, periodsPerCycle] = await Promise.all([
      api.rpc.state.call('DappStakingApi_eras_per_build_and_earn_subperiod', ''),
      api.rpc.state.call('DappStakingApi_eras_per_voting_subperiod', ''),
      api.rpc.state.call('DappStakingApi_blocks_per_era', ''),
      api.rpc.state.call('DappStakingApi_periods_per_cycle', ''),
    ]);

    // return {
    //   standardErasPerBuildAndEarnPeriod: getNumber(erasPerBuildAndEarn),
    //   standardErasPerVotingPeriod: getNumber(erasPerVoting),
    //   standardEraLength: getNumber(eraLength),
    //   periodsPerCycle: getNumber(periodsPerCycle),
    // };
    const getEraLengthsRlt = {
      standardErasPerBuildAndEarnPeriod: getNumber(erasPerBuildAndEarn),
      standardErasPerVotingPeriod: getNumber(erasPerVoting),
      standardEraLength: getNumber(eraLength),
      periodsPerCycle: getNumber(periodsPerCycle),
    };
    console.log(getEraLengthsRlt);

    const eraLengthRef = getEraLengthsRlt;

    const info = await api.query.dappStaking.currentEraInfo<PalletDappStakingV3EraInfo>();

    const getCurrentEraInfoRlt = {
      totalLocked: info.totalLocked.toBigInt(),
      activeEraLocked: info.activeEraLocked?.toBigInt(),
      unlocking: info.unlocking.toBigInt(),
      currentStakeAmount: mapStakeAmount(info.currentStakeAmount),
      nextStakeAmount: mapStakeAmount(info.nextStakeAmount),
    };
    console.log(getCurrentEraInfoRlt);
    const currentEraInfoRef = getCurrentEraInfoRlt;



    // const eraLengthRef: EraLengths = eraLengths.value;
    // const currentEraInfoRef = currentEraInfo.value;
    if (
      !eraLengthRef.standardEraLength ||
      !currentEraInfoRef ||
      !currentEraInfoRef.nextStakeAmount
    ) {
      return { stakerApr: 0, bonusApr: 0 };
    }


    // public async getInflationConfiguration(): Promise<InflationConfiguration> {
    // const api = await this.api.getApi();
    const dataConf =
      await api.query.inflation.activeInflationConfig<PalletInflationActiveInflationConfig>();

    const getInflationConfigurationRlt = {
      issuanceSafetyCap: dataConf.issuanceSafetyCap.toBigInt(),
      collatorRewardPerBlock: dataConf.collatorRewardPerBlock.toBigInt(),
      treasuryRewardPerBlock: dataConf.treasuryRewardPerBlock.toBigInt(),
      dappRewardPoolPerEra: dataConf.dappRewardPoolPerEra.toBigInt(),
      baseStakerRewardPoolPerEra: dataConf.baseStakerRewardPoolPerEra.toBigInt(),
      adjustableStakerRewardPoolPerEra: dataConf.adjustableStakerRewardPoolPerEra.toBigInt(),
      bonusRewardPoolPerPeriod: dataConf.bonusRewardPoolPerPeriod.toBigInt(),
      idealStakingRate: Number(dataConf.idealStakingRate.toBigInt() / BigInt('10000000000000000')),
    };
    // }

    // public async getInflationParams(): Promise<InflationParam> {
    // const api = await this.api.getApi();
    const dataParam = await api.query.inflation.inflationParams<PalletInflationInflationParams>();

    const getInflationParamsRlt = {
      maxInflationRate: String(dataParam.maxInflationRate),
      adjustableStakersPart: String(dataParam.adjustableStakersPart),
      baseStakersPart: String(dataParam.baseStakersPart),
      idealStakingRate: String(dataParam.idealStakingRate),
    };
    // }


    // const inflationRepo = container.get<IInflationRepository>(Symbols.InflationRepository);
    // const [inflationParams, inflationConfiguration, totalIssuanceRaw] = await Promise.all([
    //   inflationRepo.getInflationParams(),
    //   inflationRepo.getInflationConfiguration(),
    //   // apiRef.query.balances.totalIssuance(),
    //   api.query.balances.totalIssuance(),
    // ]);
    const inflationParams = getInflationParamsRlt;
    const inflationConfiguration = getInflationConfigurationRlt;
    const totalIssuanceRaw = (await api.query.balances.totalIssuance());
    // const totalIssuanceRaw = (await api.query.balances.totalIssuance()).toHex();
    // const totalIssuanceRaw = new BN((await api.query.balances.totalIssuance()).toString());

    const bonusRewardsPoolPerPeriod = inflationConfiguration.bonusRewardPoolPerPeriod.toString();

    const stakerApr = await getStakerApr({
      totalIssuance: totalIssuanceRaw,
      inflationParams,
      currentEraInfo: currentEraInfoRef,
      eraLength: eraLengthRef,
    });

    const bonusApr = await getBonusApr({
      currentEraInfo: currentEraInfoRef,
      eraLength: eraLengthRef,
      bonusRewardsPoolPerPeriod,
    });

    const rlt = { stakerApr, bonusApr };

    console.log(rlt)
    // console.log(currentEraInfoRef)
  } catch (error) {
    return { stakerApr: 0, bonusApr: 0 };
  }
};
getApr().catch(console.error).finally(() => process.exit());



export interface EraLengths {
  standardErasPerBuildAndEarnPeriod: number;
  standardErasPerVotingPeriod: number;
  standardEraLength: number;
  periodsPerCycle: number;
}

export interface PalletDappStakingV3EraInfo extends Struct {
  readonly activeEraLocked: Compact<u128>;
  readonly totalLocked: Compact<u128>;
  readonly unlocking: Compact<u128>;
  readonly currentStakeAmount: PalletDappStakingV3StakeAmount;
  readonly nextStakeAmount: PalletDappStakingV3StakeAmount;
}

export interface PalletDappStakingV3StakeAmount extends Struct {
  readonly voting: Compact<u128>;
  readonly buildAndEarn: Compact<u128>;
  readonly era: Compact<u32>;
  readonly period: Compact<u32>;
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

export interface StakeAmount {
  readonly voting: bigint;
  readonly buildAndEarn: bigint;
  readonly era: number;
  readonly period: number;
  readonly totalStake: bigint;
}

export interface PalletInflationActiveInflationConfig extends Struct {
  readonly issuanceSafetyCap: Compact<u128>;
  readonly collatorRewardPerBlock: Compact<u128>;
  readonly treasuryRewardPerBlock: Compact<u128>;
  readonly dappRewardPoolPerEra: Compact<u128>;
  readonly baseStakerRewardPoolPerEra: Compact<u128>;
  readonly adjustableStakerRewardPoolPerEra: Compact<u128>;
  readonly bonusRewardPoolPerPeriod: Compact<u128>;
  readonly idealStakingRate: Perquintill;
}

export interface PalletInflationInflationParams extends Struct {
  readonly maxInflationRate: String;
  readonly adjustableStakersPart: String;
  readonly baseStakersPart: String;
  readonly idealStakingRate: String;
}

const getStakerApr = async ({
  totalIssuance,
  inflationParams,
  currentEraInfo,
  eraLength,
}: {
  totalIssuance: u128;
  inflationParams: InflationParam;
  currentEraInfo: EraInfo;
  eraLength: EraLengths;
}): Promise<number> => {
  const numTotalIssuance = Number(ethers.utils.formatEther(totalIssuance.toString()));
  const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
  const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
  const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
  const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);

  const cyclesPerYear = getCyclePerYear(eraLength);
  // const currentStakeAmount = isVotingPeriod.value
  const currentStakeAmount = (await isVotingPeriod())
    ? toAstr(currentEraInfo!.nextStakeAmount!.voting)
    : toAstr(currentEraInfo.currentStakeAmount.voting) +
    toAstr(currentEraInfo.currentStakeAmount.buildAndEarn);

  const stakedPercent = currentStakeAmount / numTotalIssuance;
  const stakerRewardPercent =
    baseStakersPart + adjustableStakersPart * Math.min(1, stakedPercent / idealStakingRate);

  const stakerApr =
    ((yearlyInflation * stakerRewardPercent) / stakedPercent) * cyclesPerYear * 100;
  return stakerApr;
};

export interface InflationParam {
  readonly maxInflationRate: string;
  readonly adjustableStakersPart: string;
  readonly baseStakersPart: string;
  readonly idealStakingRate: string;
}

export interface EraInfo {
  readonly activeEraLocked?: bigint;
  readonly totalLocked: bigint;
  readonly unlocking: bigint;
  readonly currentStakeAmount: StakeAmount;
  readonly nextStakeAmount?: StakeAmount;
}

const percentageToNumber = (percent: string): number => {
  // e.g.: percent 1%: 10000000000000000
  return Number(percent) * 0.0000000000000001 * 0.01;
};

const getCyclePerYear = (eraLength: EraLengths): number => {
  const secBlockProductionRate = 12;
  const secsOneYear = 365 * 24 * 60 * 60;
  const periodLength =
    eraLength.standardErasPerBuildAndEarnPeriod + eraLength.standardErasPerVotingPeriod;

  // const eraPerCycle = periodLength * periodsPerCycle.value;
  const eraPerCycle = periodLength * eraLength.periodsPerCycle;
  const blocksStandardEraLength = eraLength.standardEraLength;
  const blockPerCycle = blocksStandardEraLength * eraPerCycle;
  const cyclePerYear = secsOneYear / secBlockProductionRate / blockPerCycle;
  return cyclePerYear;
};

async function isVotingPeriod() {
  let result = false;
  (await getProtocolState()).periodInfo.subperiod === PeriodType.Voting ?
    result = true : result = false;

  return result;
}



async function getProtocolState(): Promise<ProtocolState> {
  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  const state = await api.query.dappStaking.activeProtocolState<PalletDappStakingV3ProtocolState>();

  return mapToModel(state);
}

export interface PalletDappStakingV3ProtocolState extends Struct {
  readonly era: Compact<u32>;
  readonly nextEraStart: Compact<u32>;
  readonly periodInfo: PalletDappStakingV3PeriodInfo;
  readonly maintenance: bool;
}

interface PalletDappStakingV3PeriodInfo extends Struct {
  readonly number: Compact<u32>;
  readonly subperiod: PalletDappStakingV3PeriodType;
  readonly nextSubperiodStartEra: Compact<u32>;
}

interface PalletDappStakingV3PeriodType extends Enum {
  readonly isVoting: boolean;
  readonly isBuildAndEarn: boolean;
  readonly type: 'Voting' | 'BuildAndEarn';
}

// General information & state of the dApp staking protocol.
export interface ProtocolState {
  // Ongoing era number.
  era: EraNumber;
  // Block number at which the next era should start.
  nextEraStart: BlockNumber;
  // Ongoing period type and when is it expected to end.
  periodInfo: PeriodInfo;
  // `true` if pallet is in maintenance mode (disabled), `false` otherwise.
  maintenance: boolean;
}

export type PeriodNumber = number;
export type EraNumber = number;
export type BlockNumber = number;

export interface PeriodInfo {
  number: PeriodNumber;
  subperiod: PeriodType;
  nextSubperiodStartEra: EraNumber;
}

export enum PeriodType {
  Voting = 'Voting',
  BuildAndEarn = 'BuildAndEarn',
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

const toAstr = (wei: bigint): number => {
  return Number(ethers.utils.formatEther(String(wei)));
};

const getBonusApr = async ({
  currentEraInfo,
  eraLength,
  bonusRewardsPoolPerPeriod,
}: {
  currentEraInfo: EraInfo;
  eraLength: EraLengths;
  bonusRewardsPoolPerPeriod: string;
}): Promise<number> => {
  // Memo: Any amount can be simulated
  const simulatedVoteAmount = 1000;

  const cyclesPerYear = getCyclePerYear(eraLength);

  const formattedBonusRewardsPoolPerPeriod = Number(
    ethers.utils.formatEther(bonusRewardsPoolPerPeriod)
  );

  // Memo: equivalent to 'totalVpStake' in the runtime query
  // const voteAmount = isVotingPeriod.value
  const voteAmount = (await isVotingPeriod())
    ? toAstr(currentEraInfo.nextStakeAmount!.voting)
    : toAstr(currentEraInfo.currentStakeAmount.voting);

  const bonusPercentPerPeriod = formattedBonusRewardsPoolPerPeriod / voteAmount;
  const simulatedBonusPerPeriod = simulatedVoteAmount * bonusPercentPerPeriod;
  // const periodsPerYear = periodsPerCycle.value * cyclesPerYear;
  const periodsPerYear = eraLength.periodsPerCycle * cyclesPerYear;
  const simulatedBonusAmountPerYear = simulatedBonusPerPeriod * periodsPerYear;
  const bonusApr = (simulatedBonusAmountPerYear / simulatedVoteAmount) * 100;
  return bonusApr;
};
