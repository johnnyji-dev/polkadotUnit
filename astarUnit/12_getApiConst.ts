import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';

const getApiConst = async () => {


  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;


    // const apiConsts = await api.consts;
    // console.log(apiConsts);
    /*{
      system: {
        blockWeights: [Getter],
        blockLength: [Getter],
        blockHashCount: [Getter],
        dbWeight: [Getter],
        version: [Getter],
        ss58Prefix: [Getter]
      },
      utility: { batchedCallsLimit: [Getter] },
      identity: {
        basicDeposit: [Getter],
        fieldDeposit: [Getter],
        subAccountDeposit: [Getter],
        maxSubAccounts: [Getter],
        maxAdditionalFields: [Getter],
        maxRegistrars: [Getter]
      },
      timestamp: { minimumPeriod: [Getter] },
      multisig: {
        depositBase: [Getter],
        depositFactor: [Getter],
        maxSignatories: [Getter]
      },
      proxy: {
        proxyDepositBase: [Getter],
        proxyDepositFactor: [Getter],
        maxProxies: [Getter],
        maxPending: [Getter],
        announcementDepositBase: [Getter],
        announcementDepositFactor: [Getter]
      },
      transactionPayment: { operationalFeeMultiplier: [Getter] },
      balances: {
        existentialDeposit: [Getter],
        maxLocks: [Getter],
        maxReserves: [Getter],
        maxHolds: [Getter],
        maxFreezes: [Getter]
      },
      vesting: { minVestedTransfer: [Getter], maxVestingSchedules: [Getter] },
      dappStaking: {
        eraRewardSpanLength: [Getter],
        rewardRetentionInPeriods: [Getter],
        maxNumberOfContracts: [Getter],
        maxUnlockingChunks: [Getter],
        minimumLockedAmount: [Getter],
        unlockingPeriod: [Getter],
        maxNumberOfStakedContracts: [Getter],
        minimumStakeAmount: [Getter],
        numberOfTiers: [Getter]
      },
      assets: {
        removeItemsLimit: [Getter],
        assetDeposit: [Getter],
        assetAccountDeposit: [Getter],
        metadataDepositBase: [Getter],
        metadataDepositPerByte: [Getter],
        approvalDeposit: [Getter],
        stringLimit: [Getter]
      },
      xTokens: { selfLocation: [Getter], baseXcmWeight: [Getter] },
      contracts: {
        schedule: [Getter],
        depositPerByte: [Getter],
        defaultDepositLimit: [Getter],
        depositPerItem: [Getter],
        maxCodeLen: [Getter],
        maxStorageKeyLen: [Getter],
        unsafeUnstableInterface: [Getter],
        maxDebugBufferLen: [Getter]
      },
      dappsStaking: {
        blockPerEra: [Getter],
        registerDeposit: [Getter],
        maxNumberOfStakersPerContract: [Getter],
        minimumStakingAmount: [Getter],
        palletId: [Getter],
        minimumRemainingAmount: [Getter],
        maxUnlockingChunks: [Getter],
        unbondingPeriod: [Getter],
        maxEraStakeValues: [Getter],
        unregisteredDappRewardRetention: [Getter],
        forcePalletDisabled: [Getter],
        delegateClaimFee: [Getter]
      }
    }*/
  
    const apiConsts = await api.consts.transactionPayment;
    console.log(apiConsts);
  
  } catch (e) {
    console.error(e);
  }
}
getApiConst().catch(console.error).finally(() => process.exit());



// docs > api > start > api.consts.md
// // The amount required per byte on an extrinsic
// console.log(api.consts.transactionPayment.transactionByteFee.toNumber());