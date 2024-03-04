import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import { u8aToHex } from '@polkadot/util';



const getApiConst = async () => {
  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  try {
    // const apiEvents = await api.events;
    // console.log(apiEvents);
    /*{
      system: {
        ExtrinsicSuccess: [Getter],
        ExtrinsicFailed: [Getter],
        CodeUpdated: [Getter],
        NewAccount: [Getter],
        KilledAccount: [Getter],
        Remarked: [Getter]
      },
      utility: {
        BatchInterrupted: [Getter],
        BatchCompleted: [Getter],
        BatchCompletedWithErrors: [Getter],
        ItemCompleted: [Getter],
        ItemFailed: [Getter],
        DispatchedAs: [Getter]
      },
      identity: {
        IdentitySet: [Getter],
        IdentityCleared: [Getter],
        IdentityKilled: [Getter],
        JudgementRequested: [Getter],
        JudgementUnrequested: [Getter],
        JudgementGiven: [Getter],
        RegistrarAdded: [Getter],
        SubIdentityAdded: [Getter],
        SubIdentityRemoved: [Getter],
        SubIdentityRevoked: [Getter]
      },
      multisig: {
        NewMultisig: [Getter],
        MultisigApproval: [Getter],
        MultisigExecuted: [Getter],
        MultisigCancelled: [Getter]
      },
      proxy: {
        ProxyExecuted: [Getter],
        PureCreated: [Getter],
        Announced: [Getter],
        ProxyAdded: [Getter],
        ProxyRemoved: [Getter]
      },
      parachainSystem: {
        ValidationFunctionStored: [Getter],
        ValidationFunctionApplied: [Getter],
        ValidationFunctionDiscarded: [Getter],
        UpgradeAuthorized: [Getter],
        DownwardMessagesReceived: [Getter],
        DownwardMessagesProcessed: [Getter],
        UpwardMessageSent: [Getter]
      },
      transactionPayment: { TransactionFeePaid: [Getter] },
      balances: {
        Endowed: [Getter],
        DustLost: [Getter],
        Transfer: [Getter],
        BalanceSet: [Getter],
        Reserved: [Getter],
        Unreserved: [Getter],
        ReserveRepatriated: [Getter],
        Deposit: [Getter],
        Withdraw: [Getter],
        Slashed: [Getter],
        Minted: [Getter],
        Burned: [Getter],
        Suspended: [Getter],
        Restored: [Getter],
        Upgraded: [Getter],
        Issued: [Getter],
        Rescinded: [Getter],
        Locked: [Getter],
        Unlocked: [Getter],
        Frozen: [Getter],
        Thawed: [Getter]
      },
      vesting: { VestingUpdated: [Getter], VestingCompleted: [Getter] },
      inflation: {
        InflationParametersForceChanged: [Getter],
        InflationConfigurationForceChanged: [Getter],
        ForcedInflationRecalculation: [Getter],
        NewInflationConfiguration: [Getter]
      },
      dappStaking: {
        MaintenanceMode: [Getter],
        NewEra: [Getter],
        NewSubperiod: [Getter],
        DAppRegistered: [Getter],
        DAppRewardDestinationUpdated: [Getter],
        DAppOwnerChanged: [Getter],
        DAppUnregistered: [Getter],
        Locked: [Getter],
        Unlocking: [Getter],
        ClaimedUnlocked: [Getter],
        Relock: [Getter],
        Stake: [Getter],
        Unstake: [Getter],
        Reward: [Getter],
        BonusReward: [Getter],
        DAppReward: [Getter],
        UnstakeFromUnregistered: [Getter],
        ExpiredEntriesRemoved: [Getter],
        Force: [Getter]
      },
      assets: {
        Created: [Getter],
        Issued: [Getter],
        Transferred: [Getter],
        Burned: [Getter],
        TeamChanged: [Getter],
        OwnerChanged: [Getter],
        Frozen: [Getter],
        Thawed: [Getter],
        AssetFrozen: [Getter],
        AssetThawed: [Getter],
        AccountsDestroyed: [Getter],
        ApprovalsDestroyed: [Getter],
        DestructionStarted: [Getter],
        Destroyed: [Getter],
        ForceCreated: [Getter],
        MetadataSet: [Getter],
        MetadataCleared: [Getter],
        ApprovedTransfer: [Getter],
        ApprovalCancelled: [Getter],
        TransferredApproved: [Getter],
        AssetStatusChanged: [Getter],
        AssetMinBalanceChanged: [Getter],
        Touched: [Getter],
        Blocked: [Getter]
      },
      collatorSelection: {
        NewInvulnerables: [Getter],
        NewDesiredCandidates: [Getter],
        NewCandidacyBond: [Getter],
        CandidateAdded: [Getter],
        CandidateRemoved: [Getter],
        CandidateSlashed: [Getter]
      },
      session: { NewSession: [Getter] },
      xcmpQueue: {
        Success: [Getter],
        Fail: [Getter],
        BadVersion: [Getter],
        BadFormat: [Getter],
        XcmpMessageSent: [Getter],
        OverweightEnqueued: [Getter],
        OverweightServiced: [Getter]
      },
      polkadotXcm: {
        Attempted: [Getter],
        Sent: [Getter],
        UnexpectedResponse: [Getter],
        ResponseReady: [Getter],
        Notified: [Getter],
        NotifyOverweight: [Getter],
        NotifyDispatchError: [Getter],
        NotifyDecodeFailed: [Getter],
        InvalidResponder: [Getter],
        InvalidResponderVersion: [Getter],
        ResponseTaken: [Getter],
        AssetsTrapped: [Getter],
        VersionChangeNotified: [Getter],
        SupportedVersionChanged: [Getter],
        NotifyTargetSendFail: [Getter],
        NotifyTargetMigrationFail: [Getter],
        InvalidQuerierVersion: [Getter],
        InvalidQuerier: [Getter],
        VersionNotifyStarted: [Getter],
        VersionNotifyRequested: [Getter],
        VersionNotifyUnrequested: [Getter],
        FeesPaid: [Getter],
        AssetsClaimed: [Getter]
      },
      cumulusXcm: {
        InvalidFormat: [Getter],
        UnsupportedVersion: [Getter],
        ExecutedDownward: [Getter]
      },
      dmpQueue: {
        InvalidFormat: [Getter],
        UnsupportedVersion: [Getter],
        ExecutedDownward: [Getter],
        WeightExhausted: [Getter],
        OverweightEnqueued: [Getter],
        OverweightServiced: [Getter],
        MaxMessagesExhausted: [Getter]
      },
      xcAssetConfig: {
        AssetRegistered: [Getter],
        UnitsPerSecondChanged: [Getter],
        AssetLocationChanged: [Getter],
        SupportedAssetRemoved: [Getter],
        AssetRemoved: [Getter]
      },
      xTokens: { TransferredMultiAssets: [Getter] },
      evm: {
        Log: [Getter],
        Created: [Getter],
        CreatedFailed: [Getter],
        Executed: [Getter],
        ExecutedFailed: [Getter]
      },
      ethereum: { Executed: [Getter] },
      dynamicEvmBaseFee: { NewBaseFeePerGas: [Getter] },
      contracts: {
        Instantiated: [Getter],
        Terminated: [Getter],
        CodeStored: [Getter],
        ContractEmitted: [Getter],
        CodeRemoved: [Getter],
        ContractCodeUpdated: [Getter],
        Called: [Getter],
        DelegateCalled: [Getter]
      },
      sudo: { Sudid: [Getter], KeyChanged: [Getter], SudoAsDone: [Getter] },
      staticPriceProvider: { PriceSet: [Getter] },
      dappStakingMigration: { EntriesMigrated: [Getter], EntriesDeleted: [Getter] },
      dappsStaking: {
        BondAndStake: [Getter],
        UnbondAndUnstake: [Getter],
        WithdrawFromUnregistered: [Getter],
        Withdrawn: [Getter],
        NewContract: [Getter],
        ContractRemoved: [Getter],
        NewDappStakingEra: [Getter],
        Reward: [Getter],
        MaintenanceMode: [Getter],
        RewardDestination: [Getter],
        NominationTransfer: [Getter],
        StaleRewardBurned: [Getter],
        Decommission: [Getter]
      }
    }*/

    const addr = 'a7ZEP29Zk9vrfNWiENXdhLQWxp3yVSvaTBtTcJAkDKHijwX';
    // const extrinsicHash = '0x38b59f69b4f0764ea528a0f6b8470faf366f3aebec9131c9db8edff13564f224';
    // const height = '5628041'; //       actualFee: '76,409,006,026,544,817',
    // const height = '5613066'; //      actualFee: '76,362,006,026,544,817',
    // const height = '5613067'; //      actualFee: '76,362,006,026,544,817',
    const height = '5577909'; //      actualFee: '76,362,006,026,544,817',

    const blockHash = await api.rpc.chain.getBlockHash(height);
    // console.log(blockHash.toHuman());
    const signedBlock = await api.rpc.chain.getBlock(blockHash);
    // console.log(signedBlock.toHuman());
    const apiAt = await api.at(signedBlock.block.header.hash);
    // console.log(apiAt);
    const allRecords = (await apiAt.query.system.events()).toArray();
    // console.log(allRecords);

    // const feeEvent = allRecords.find((e) => {
    //   console.log(e.toHuman())
    // });

    let feeEvent = '0';
    let idx = 0;
    
    allRecords.find((e) => {
      console.log(e.toHuman(), idx++);
      // console.log(idx++);
      // console.log(e.toHuman()?.event?.data?.who);

      e.toHuman()?.event?.data?.who == addr ? feeEvent = e.toHuman()?.event?.data?.actualFee : feeEvent = feeEvent;
      // `${e.toHuman()?.event?.data?.who}` == `${addr}` ? console.log('yes') : console.log('no'); // Okay
      // `${e.toHuman()?.event?.data?.who}` == `${addr}` ? console.log(e.toHuman()?.event?.data?.actualFee) : console.log('no'); // Okay
      // console.log("\n=====\n");

      

      // if (
      //   `${e.toHuman()?.event?.data?.who}` == `${addr}` &&
      //   e
      // )

      

    });

    console.log(feeEvent);
  } catch (e) {
    console.error(e);
  }
}
getApiConst().catch(console.error).finally(() => process.exit());



// docs > api > start > api.consts.md
// // The amount required per byte on an extrinsic
// console.log(api.consts.transactionPayment.transactionByteFee.toNumber());


// ### TransactionFeePaid(`AccountId32`, `u128`, `u128`)
// - **interface**: `api.events.transactionPayment.TransactionFeePaid.is`
// - **summary**:    A transaction fee `actual_fee`, of which `tip` was added to the minimum inclusion fee,  has been paid by `who`. 

// export const getBlockEvents = async (api: ApiPromise, blockHash: string) => {
//   const apiInstanceAtBlock = await api.at(blockHash);
//   const blockEvents = (await apiInstanceAtBlock.query.system.events()).toArray();

//   return blockEvents;
// };