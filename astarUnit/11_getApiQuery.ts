import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';

const getApiQuery = async () => {


  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;


    const apiQuery = await api.query;
    console.log(apiQuery);
    /*{
      substrate: {
        changesTrieConfig: [Getter],
        childStorageKeyPrefix: [Getter],
        code: [Getter],
        extrinsicIndex: [Getter],
        heapPages: [Getter],
        intrablockEntropy: [Getter]
      },
      system: {
        palletVersion: [Getter],
        account: [Getter],
        extrinsicCount: [Getter],
        blockWeight: [Getter],
        allExtrinsicsLen: [Getter],
        blockHash: [Getter],
        extrinsicData: [Getter],
        number: [Getter],
        parentHash: [Getter],
        digest: [Getter],
        events: [Getter],
        eventCount: [Getter],
        eventTopics: [Getter],
        lastRuntimeUpgrade: [Getter],
        upgradedToU32RefCount: [Getter],
        upgradedToTripleRefCount: [Getter],
        executionPhase: [Getter]
      },
      identity: {
        palletVersion: [Getter],
        identityOf: [Getter],
        superOf: [Getter],
        subsOf: [Getter],
        registrars: [Getter]
      },
      timestamp: { palletVersion: [Getter], now: [Getter], didUpdate: [Getter] },
      multisig: { palletVersion: [Getter], multisigs: [Getter] },
      proxy: {
        palletVersion: [Getter],
        proxies: [Getter],
        announcements: [Getter]
      },
      parachainSystem: {
        palletVersion: [Getter],
        pendingValidationCode: [Getter],
        newValidationCode: [Getter],
        validationData: [Getter],
        didSetValidationCode: [Getter],
        lastRelayChainBlockNumber: [Getter],
        upgradeRestrictionSignal: [Getter],
        relayStateProof: [Getter],
        relevantMessagingState: [Getter],
        hostConfiguration: [Getter],
        lastDmqMqcHead: [Getter],
        lastHrmpMqcHeads: [Getter],
        processedDownwardMessages: [Getter],
        hrmpWatermark: [Getter],
        hrmpOutboundMessages: [Getter],
        upwardMessages: [Getter],
        pendingUpwardMessages: [Getter],
        announcedHrmpMessagesPerCandidate: [Getter],
        reservedXcmpWeightOverride: [Getter],
        reservedDmpWeightOverride: [Getter],
        authorizedUpgrade: [Getter],
        customValidationHeadData: [Getter]
      },
      parachainInfo: { palletVersion: [Getter], parachainId: [Getter] },
      transactionPayment: {
        palletVersion: [Getter],
        nextFeeMultiplier: [Getter],
        storageVersion: [Getter]
      },
      balances: {
        palletVersion: [Getter],
        totalIssuance: [Getter],
        inactiveIssuance: [Getter],
        account: [Getter],
        locks: [Getter],
        reserves: [Getter],
        holds: [Getter],
        freezes: [Getter]
      },
      vesting: {
        palletVersion: [Getter],
        vesting: [Getter],
        storageVersion: [Getter]
      },
      inflation: {
        palletVersion: [Getter],
        activeInflationConfig: [Getter],
        inflationParams: [Getter],
        doRecalculation: [Getter]
      },
      dappStaking: {
        palletVersion: [Getter],
        activeProtocolState: [Getter],
        nextDAppId: [Getter],
        integratedDApps: [Getter],
        counterForIntegratedDApps: [Getter],
        ledger: [Getter],
        stakerInfo: [Getter],
        contractStake: [Getter],
        currentEraInfo: [Getter],
        eraRewards: [Getter],
        periodEnd: [Getter],
        staticTierParams: [Getter],
        tierConfig: [Getter],
        dAppTiers: [Getter],
        historyCleanupMarker: [Getter],
        safeguard: [Getter]
      },
      assets: {
        palletVersion: [Getter],
        asset: [Getter],
        account: [Getter],
        approvals: [Getter],
        metadata: [Getter]
      },
      authorship: { palletVersion: [Getter], author: [Getter] },
      collatorSelection: {
        palletVersion: [Getter],
        invulnerables: [Getter],
        candidates: [Getter],
        lastAuthoredBlock: [Getter],
        desiredCandidates: [Getter],
        candidacyBond: [Getter],
        slashDestination: [Getter]
      },
      session: {
        palletVersion: [Getter],
        validators: [Getter],
        currentIndex: [Getter],
        queuedChanged: [Getter],
        queuedKeys: [Getter],
        disabledValidators: [Getter],
        nextKeys: [Getter],
        keyOwner: [Getter]
      },
      aura: {
        palletVersion: [Getter],
        authorities: [Getter],
        currentSlot: [Getter]
      },
      auraExt: { palletVersion: [Getter], authorities: [Getter] },
      xcmpQueue: {
        palletVersion: [Getter],
        inboundXcmpStatus: [Getter],
        inboundXcmpMessages: [Getter],
        outboundXcmpStatus: [Getter],
        outboundXcmpMessages: [Getter],
        signalMessages: [Getter],
        queueConfig: [Getter],
        overweight: [Getter],
        counterForOverweight: [Getter],
        overweightCount: [Getter],
        queueSuspended: [Getter]
      },
      polkadotXcm: {
        palletVersion: [Getter],
        queryCounter: [Getter],
        queries: [Getter],
        assetTraps: [Getter],
        safeXcmVersion: [Getter],
        supportedVersion: [Getter],
        versionNotifiers: [Getter],
        versionNotifyTargets: [Getter],
        versionDiscoveryQueue: [Getter],
        currentMigration: [Getter],
        remoteLockedFungibles: [Getter],
        lockedFungibles: [Getter],
        xcmExecutionSuspended: [Getter]
      },
      dmpQueue: {
        palletVersion: [Getter],
        configuration: [Getter],
        pageIndex: [Getter],
        pages: [Getter],
        overweight: [Getter],
        counterForOverweight: [Getter]
      },
      xcAssetConfig: {
        palletVersion: [Getter],
        assetIdToLocation: [Getter],
        assetLocationToId: [Getter],
        assetLocationUnitsPerSecond: [Getter]
      },
      evm: {
        palletVersion: [Getter],
        accountCodes: [Getter],
        accountCodesMetadata: [Getter],
        accountStorages: [Getter]
      },
      ethereum: {
        palletVersion: [Getter],
        pending: [Getter],
        currentBlock: [Getter],
        currentReceipts: [Getter],
        currentTransactionStatuses: [Getter],
        blockHash: [Getter]
      },
      dynamicEvmBaseFee: { palletVersion: [Getter], baseFeePerGas: [Getter] },
      contracts: {
        palletVersion: [Getter],
        pristineCode: [Getter],
        codeStorage: [Getter],
        ownerInfoOf: [Getter],
        nonce: [Getter],
        contractInfoOf: [Getter],
        deletionQueue: [Getter],
        deletionQueueCounter: [Getter],
        migrationInProgress: [Getter]
      },
      sudo: { palletVersion: [Getter], key: [Getter] },
      staticPriceProvider: { palletVersion: [Getter], activePrice: [Getter] },
      dappStakingMigration: { palletVersion: [Getter], migrationStateStorage: [Getter] },
      dappsStaking: {
        palletVersion: [Getter],
        palletDisabled: [Getter],
        decommissionStarted: [Getter],
        ledger: [Getter],
        currentEra: [Getter],
        blockRewardAccumulator: [Getter],
        forceEra: [Getter],
        nextEraStartingBlock: [Getter],
        registeredDevelopers: [Getter],
        registeredDapps: [Getter],
        generalEraInfo: [Getter],
        contractEraStake: [Getter],
        generalStakerInfo: [Getter],
        storageVersion: [Getter]
      }
    }*/
  } catch (e) {
    console.error(e);
    return [];
  }
}
getApiQuery().catch(console.error).finally(() => process.exit());