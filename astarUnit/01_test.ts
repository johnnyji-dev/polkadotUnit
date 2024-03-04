import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { estimatePendingRewards, fetchRewardsDistributionConfig, fmtAmtFromKSeparator, getDappAddressEnum, hasProperty, removeKSeparator } from '@astar-network/astar-sdk-core';
import { Option, StorageKey, u32, u128, Bytes } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { ethers } from 'ethers';
import { shibuDappList } from './shibu-dapps';
import { astarDappList } from './astar-dapps';

const testAcnt1 = 'bHkgWQw7eSx1zn2kv5Z9EXMhx7ecS3BmP3dEL6MhrcgodiC';
const testAcnt2 = 'XJK8XsYuVaLH9L4yetkyRtDi1GKJteyRJbWtTmgphMgu5m8';
const testAcnt3 = 'X64MTWdusk3Ey3WdAh5L5ygn1HhYjrUG4a6tuo3jKkCbT7C';

const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

const getRewards = async (addr) => {

    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const ledger = await api.query.dappStaking.ledger<any>(addr);

    console.log(`ledger : ${ledger}`);
    // *** 1. Determine last claimable era.
    const {
        firstStakedEra,
        lastStakedEra,
        firstSpanIndex,
        lastSpanIndex,
        rewardsExpired,
        eraRewardSpanLength,
        lastStakedPeriod,
      } = await getStakerEraRange(addr);

      let result = {
        amount: BigInt(0),
        period: lastStakedPeriod,
        eraCount: 0,
      };
  
      if (rewardsExpired) {
        return result;
      }
  
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

      console.log(`rewards : ${result}`);
}
getRewards(testAcnt3).catch(console.error).finally(() => process.exit());

async function getEraRewards(spanIndex: number): Promise<EraRewardSpan | undefined> {
    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
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

async function getConstants(): Promise<Constants> {
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
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


async function getStakerEraRange(senderAddress) {

    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const [protocolState, ledger, constants] = await Promise.all([
    //   this.dappStakingRepository.getProtocolState(),
        api.query.dappStaking.activeProtocolState<PalletDappStakingV3ProtocolState>(),
    //   this.dappStakingRepository.getAccountLedger(senderAddress),
        api.query.dappStaking.ledger<PalletDappStakingV3AccountLedger>(senderAddress),
    //   await this.dappStakingRepository.getConstants(),
        getConstants(),
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

  async function getPeriodEndInfo(period: number): Promise<PeriodEndInfo | undefined> {
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
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

function hasRewardsExpired(
    stakedPeriod: number,
    currentPeriod: number,
    rewardRetentionInPeriods: number
  ): boolean {
    return stakedPeriod < currentPeriod - rewardRetentionInPeriods;
  }



const getList = async () => {
    // const list = shibuDappList;
    const list = astarDappList;
    console.log(list.length)
}
// getList().catch(console.error).finally(() => process.exit());
const getChainDapps = async () => {

    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const api = await this.api.getApi();
    const dapps = await api.query.dappStaking.integratedDApps.entries();
    const result: DappInfo[] = [];

    dapps.forEach(([key, value]) => {
      const v = <Option<PalletDappStakingV3DAppInfo>>value;
      const address = getContractAddress(key.args[0] as unknown as SmartContractAddress);

      if (v.isSome) {
        const unwrappedValue = v.unwrap();

        if (address) {
          result.push(mapDapp(unwrappedValue, address));
        }
      }
    });

    // return result;
    console.log(result);
}
function getContractAddress(address: SmartContractAddress): string | undefined {
    return address.isEvm ? address.asEvm?.toString() : address.asWasm?.toString();
}
function mapDapp(dapp: PalletDappStakingV3DAppInfo, address: string): DappInfo {
    return {
      address,
      owner: dapp.owner.toString(),
      id: dapp.id.toNumber(),
      state: DappState.Registered, // All dApss from integratedDApps are registered.
      rewardDestination: dapp.rewardBeneficiary.unwrapOr(undefined)?.toString(),
    };
  }
// getChainDapps().catch(console.error).finally(() => process.exit());


const getStakingInfo = async (address: string) => {

    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    /*
    let ss558Address = address;
    const [state, result] = await Promise.all([
        api.query.dappStaking.activeProtocolState(),
        api.query.dappStaking.stakerInfo.entries(ss558Address),
    ]);
    const period = state.periodInfo.number.toNumber();
    const total = result.reduce((sum, [key, value]) => {
        // const singularStakingInfo = <Option<PalletDappStakingV3SingularStakingInfo>>value;
        const singularStakingInfo = value;
        console.log(`key : ${key}`);
        console.log(`value : ${value}`);
        const unwrapped = singularStakingInfo.unwrapOrDefault();
        if (unwrapped.staked.period.toNumber() !== period) {
            return sum;
        }
        const buildAndEarn = unwrapped.staked.buildAndEarn.toBigInt();
        const voting = unwrapped.staked.voting.toBigInt();
        return sum + buildAndEarn + voting;
    }, BigInt(0));
    // return total;
    console.log(`total : ${total}`);
    */

    // const test = await api.query.dappStaking.stakerInfo.entries(address);
    // const test = await api.query.dappStaking.currentEraInfo();
    // console.log(`test : ${test}`);
    // test : {"totalLocked":"0x000000000005b44cc8e97ebd1beaa424","unlocking":"0x0000000000001f66f48c27feba30acd1","currentStakeAmount":{"voting":"0x0000000000011f47223b13f862c70000","buildAndEarn":"0x000000000000abd3bd68f688c0920000","era":4480,"period":8},"nextStakeAmount":{"voting":"0x0000000000011f47223b13f862c70000","buildAndEarn":"0x000000000000ac19abc19bd23e7a0000","era":4481,"period":8}}
    
    const test = await api.query.dappStaking.currentEraInfo();
    console.log(`test : ${test}`);


}
// getStakingInfo(testAcnt3).catch(console.error).finally(() => process.exit());


const getTest = async () => {

    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const test = await api.query.hasOwnProperty('dappStaking');
    // console.log(test); // true

    // const test1 = await api.query.dappStaking.activeProtocolState();
    // console.log(test1.toHuman());
    // const test1ToHum = test1.toHuman();
    // console.log(test1ToHum.periodInfo.number);
    /*{
        era: '4,479',
        nextEraStart: '5,767,615',
        periodInfo: {
          number: '9',
          subperiod: 'BuildAndEarn',
          nextSubperiodStartEra: '4,492'
        },
        maintenance: false
      }*/
    // const test2 = await api.query.dappStaking.periodEnd<Option<any>>(test1ToHum.periodInfo.number);
    // console.log(test2.toHuman());

    const test = await api.query.dappStaking.stakerInfo.entries(testAcnt3);
    console.log(test);

}
// getTest().catch(console.error).finally(() => process.exit());


const getEstimatedReward = async () => {

    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

        const estimatedReward = await estimatePendingRewards({
            api,
            walletAddress: testAcnt2
        })
        console.log(`staker : ${testAcnt2} | estimatedReward : ${estimatedReward}`);
}
// getEstimatedReward().catch(console.error).finally(() => process.exit());

const locked = async () => {
    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    
    const locked = await api.query.dappStaking.ledger(testAcnt1)
    console.log(locked.toHuman());


} // O / blocknumber-string
// locked().catch(console.error).finally(() => process.exit());


const getFormattedAmount = (amount) => {
    console.log(ethers.utils.parseEther(amount).toBigInt());
}
// getFormattedAmount('500000');



// function mapDapp(dapp: any, address: string): DappInfo {
//     return {
//       address,
//       owner: dapp.owner.toString(),
//       id: dapp.id.toNumber(),
//       state: DappState.Registered, // All dApss from integratedDApps are registered.
//       rewardDestination: dapp.rewardBeneficiary.unwrapOr(undefined)?.toString(),
//     }
// }


const getMetadata = async () => {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    // const provider = new HttpProvider('https://shibuya-rpc.dwellir.com');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const metaData = (await api.rpc.state.getMetadata()).toHex();
    console.log(metaData);
} // O / blocknumber-string
// getMetadata().catch(console.error).finally(() => process.exit());



const testDappStaking = async () => {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    // const provider = new HttpProvider('https://shibuya-rpc.dwellir.com');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const dAppStaking = await api.tx.dappsStaking;
    // const dAppStaking = await api.tx;
    // [Function (anonymous)] {
    //     system: [Getter],
    //     utility: [Getter],
    //     identity: [Getter],
    //     timestamp: [Getter],
    //     multisig: [Getter],
    //     proxy: [Getter],
    //     parachainSystem: [Getter],
    //     parachainInfo: [Getter],
    //     balances: [Getter],
    //     vesting: [Getter],
    //     inflation: [Getter],
    //     dappStaking: [Getter],
    //     assets: [Getter],
    //     collatorSelection: [Getter],
    //     session: [Getter],
    //     xcmpQueue: [Getter],
    //     polkadotXcm: [Getter],
    //     cumulusXcm: [Getter],
    //     dmpQueue: [Getter],
    //     xcAssetConfig: [Getter],
    //     xTokens: [Getter],
    //     evm: [Getter],
    //     ethereum: [Getter],
    //     dynamicEvmBaseFee: [Getter],
    //     contracts: [Getter],
    //     sudo: [Getter],
    //     staticPriceProvider: [Getter],
    //     dappStakingMigration: [Getter],
    //     dappsStaking: [Getter]
    //   }
    const dAppStaking = await api.tx.dappStaking;
    console.log(dAppStaking);
} // O / blocknumber-string
// testDappStaking().catch(console.error).finally(() => process.exit());


const getVersion = async () => {
    // 5.32.1-5e67f1b9069
    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // 5.32.1-5e67f1b9069
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    // 5.31.0-83a4a81a6d4
    const provider = new HttpProvider('https://shibuya-rpc.dwellir.com');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const dapps = await api.query.dappsStaking.integratedDApps?.entries();
    // const version = await api.consts.system.version;
    // console.log(version.toHuman());
    // const version = await api.call.core.version;
    // console.log(version);
    const version = await api.rpc.system.version();
    console.log(version.toHuman());
} // O / blocknumber-string
// getVersion().catch(console.error).finally(() => process.exit());

// [Function (anonymous)] {
//     meta: {
//       method: 'version',
//       name: 'Core_version',
//       section: 'core',
//       sectionHash: '0xdf6acb689907609b',
//       description: 'Returns the version of the runtime.',
//       params: [],
//       type: 'RuntimeVersion'
//     }
//   }

// {
//     specName: 'astar',
//     implName: 'astar',
//     authoringVersion: '1',
//     specVersion: '80',
//     implVersion: '0',
//     apis: [
//       [ '0xdf6acb689907609b', '4' ],
//       [ '0x37e397fc7c91f5e4', '2' ],
//       [ '0xdd718d5cc53262d4', '1' ],
//       [ '0x40fe3ad401f8959a', '6' ],
//       [ '0xd2bc9897eed08f15', '3' ],
//       [ '0xf78b278be53f454c', '2' ],
//       [ '0xbc9d89904f5b923f', '1' ],
//       [ '0x37c8bb1350a9a2a8', '4' ],
//       [ '0xf3ff14d5ab527059', '3' ],
//       [ '0xab3c0572291feb8b', '1' ],
//       [ '0xea93e3f16f3d6962', '2' ],
//       [ '0x582211f65bb14b89', '5' ],
//       [ '0xe65b00e46cedd0aa', '2' ],
//       [ '0x68b66ba122c93fa7', '2' ],
//       [ '0xe8accb82fb152951', '1' ]
//     ],
//     transactionVersion: '2',
//     stateVersion: '1'
//   }

// {
//     specName: 'shibuya',
//     implName: 'shibuya',
//     authoringVersion: '1',
//     specVersion: '122',
//     implVersion: '0',
//     apis: [
//       [ '0xdf6acb689907609b', '4' ],
//       [ '0x37e397fc7c91f5e4', '2' ],
//       [ '0xdd718d5cc53262d4', '1' ],
//       [ '0x40fe3ad401f8959a', '6' ],
//       [ '0xd2bc9897eed08f15', '3' ],
//       [ '0xf78b278be53f454c', '2' ],
//       [ '0xbc9d89904f5b923f', '1' ],
//       [ '0x37c8bb1350a9a2a8', '4' ],
//       [ '0xf3ff14d5ab527059', '3' ],
//       [ '0xab3c0572291feb8b', '1' ],
//       [ '0xea93e3f16f3d6962', '2' ],
//       [ '0x582211f65bb14b89', '5' ],
//       [ '0xe65b00e46cedd0aa', '2' ],
//       [ '0x68b66ba122c93fa7', '2' ],
//       [ '0xe8accb82fb152951', '1' ]
//     ],
//     transactionVersion: '2',
//     stateVersion: '1'
//   }


async function getNonce() {
    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const accountBalInfo = await api.derive.balances.account(testAcnt1);
    console.log(accountBalInfo.accountNonce.toString());
} // O / 3
// getNonce().catch(console.error).finally(() => process.exit());


const getDappInfo = async () => {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const dapps = await api.query.dappsStaking.integratedDApps?.entries();
    const dapps = await api.query;
    console.log(dapps);
} // O / blocknumber-string
// getDappInfo().catch(console.error).finally(() => process.exit());



const getLatestBlockNumber = async () => {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const lastHeader = await api.rpc.chain.getHeader();
    console.log(lastHeader.number.toHuman());
} // O / blocknumber-string
// getLatestBlockNumber().catch(console.error).finally(() => process.exit());


const generalStakerInfo = async () => {
    // Create a new instance of the api
    // const provider = new WsProvider('wss://rpc.shibuya.astar.network');
    // const api = new ApiPromise({ provider });
    // await api.isReady;
    // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const provider = new HttpProvider('https://shibuya-rpc.dwellir.com');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const result = await api.query.dappsStaking.generalEraInfo.entries();
    const result = await api.query.dappsStaking.currentEra();
    console.log(result);
}
// generalStakerInfo().catch(console.error).finally(() => process.exit());

/*
const getCurrentEra = async () => {
    // Create a new instance of the api
    // const provider = new WsProvider('wss://rpc.shibuya.astar.network');
    // const api = new ApiPromise({ provider });
    // await api.isReady;

    const testAcnt1 = 'VxJhKGJ7wsVwZvaikWQzhexb9VawgFUtBuXNAmDAhBBVi4U';
    const testAcnt2 = '5HBSNV13JH7LuEtJUBNuKgcaPgNaXGBZhCknUWrKmD9p8vhA';

    const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

    const [eraInfo, generalStakerInfo, blockHeight, blocksPerEra, rawBlockRewards, rewardsDistributionConfig] =
        await Promise.all([
            api.query.dappsStaking.generalEraInfo.entries(),
            api.query.dappsStaking.generalStakerInfo.entries(testAcnt1),
            api.query.system.number(),
            Number(api.consts.dappsStaking.blockPerEra),
            String(
                hasProperty(api.consts.blockReward, 'maxBlockRewardAmount')
                    ? api.consts.blockReward.maxBlockRewardAmount
                    : api.consts.blockReward.rewardAmount
            ),
            fetchRewardsDistributionConfig(api)
        ]);

    const eraTvls = formatEraTvls(eraInfo);
    console.log(eraTvls);

    console.log('\n ===== ===== \n');

    const currentEra = eraTvls[eraTvls.length - 1].era;
    console.log(currentEra);

    // const rlt_generalEraInfo = await api.query.dappsStaking.generalEraInfo(rlt_currentEra);
    // console.log(rlt_generalEraInfo.toHuman());
}*/
// getCurrentEra().catch(console.error).finally(() => process.exit());


const getStakeInfo = async () => {
    // Create a new instance of the api
    const provider = new WsProvider('wss://rpc.shibuya.astar.network');
    const api = new ApiPromise({ provider });

    await api.isReady;

    const testAcnt1 = 'VxJhKGJ7wsVwZvaikWQzhexb9VawgFUtBuXNAmDAhBBVi4U';
    const testAcnt2 = '5HBSNV13JH7LuEtJUBNuKgcaPgNaXGBZhCknUWrKmD9p8vhA';

    const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

    const rlt_currentEra = await api.query.dappsStaking.currentEra();
    console.log(rlt_currentEra);
    // const rlt_generalEraInfo = await api.query.dappsStaking.generalEraInfo(rlt_currentEra);
    // console.log(rlt_generalEraInfo.toHuman());
}
// getStakeInfo().catch(console.error).finally(() => process.exit());



// const formatEraTvls = (eraInfo: [StorageKey<any>, Codec][]): EraTvl[] => {
const formatEraTvls = (eraInfo: [StorageKey<any>, Codec][]): any[] => {
    return eraInfo
        .map(([key, value]) => {
            const era = key.toHuman() as string[];
            const v = value.toHuman() as { staked: string; locked: string };
            const tvl = removeKSeparator(v.staked);
            const tvlLocked = removeKSeparator(v.locked);
            return {
                era: Number(removeKSeparator(era[0])),
                tvlStaked: fmtAmtFromKSeparator(tvl),
                tvlLocked: fmtAmtFromKSeparator(tvlLocked)
            };
        })
        .sort((a, b) => a.era - b.era);
};

export interface DappInfo {
    address: string;
    owner: string;
    id: number;
    state: any;
    rewardDestination?: string;
    stakeVoting?: bigint;
    stakeBuildAndEarn?: bigint;
    totalStake?: bigint;
}



export enum DappState {
    Registered = 'Registered',
    Unregistered = 'Unregistered',
}

// export interface PalletDappStakingV3DAppInfo extends Struct {
//     readonly owner: AccountId32;
//     readonly id: Compact<u16>;
//     readonly rewardBeneficiary: Option<AccountId32>;
// }

export interface PalletDappStakingV3DAppInfo {
    readonly owner: any;
    readonly id: any;
    readonly rewardBeneficiary: any;
}