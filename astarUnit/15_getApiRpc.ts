import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';

const getApiRpc = async () => {


  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    const apiRpc = await api.rpc;
    // console.log(apiRpc);
    /*[Function (anonymous)] {
      babe: {},
      beefy: {},
      contracts: {},
      dev: { getBlockStats: [Getter] },
      engine: {},
      grandpa: {},
      mmr: {},
      syncstate: {},
      system: {
        accountNextIndex: [Getter],
        addLogFilter: [Getter],
        addReservedPeer: [Getter],
        chain: [Getter],
        chainType: [Getter],
        dryRun: [Getter],
        health: [Getter],
        localListenAddresses: [Getter],
        localPeerId: [Getter],
        name: [Getter],
        nodeRoles: [Getter],
        peers: [Getter],
        properties: [Getter],
        removeReservedPeer: [Getter],
        reservedPeers: [Getter],
        resetLogFilter: [Getter],
        syncState: [Getter],
        version: [Getter]
      },
      net: {},
      web3: {},
      eth: {},
      rpc: { methods: [Getter] },
      author: {
        hasKey: [Getter],
        hasSessionKeys: [Getter],
        insertKey: [Getter],
        pendingExtrinsics: [Getter],
        removeExtrinsic: [Getter],
        rotateKeys: [Getter],
        submitAndWatchExtrinsic: [Getter],
        submitExtrinsic: [Getter]
      },
      chain: {
        getBlock: [Getter],
        getBlockHash: [Getter],
        getFinalizedHead: [Getter],
        getHeader: [Getter]
      },
      childstate: {
        getKeys: [Getter],
        getKeysPaged: [Getter],
        getStorage: [Getter],
        getStorageEntries: [Getter],
        getStorageHash: [Getter],
        getStorageSize: [Getter]
      },
      offchain: { localStorageGet: [Getter], localStorageSet: [Getter] },
v      payment: { queryFeeDetails: [Getter], queryInfo: [Getter] },
      state: {
        call: [Getter],
        getChildReadProof: [Getter],
        getKeys: [Getter],
        getKeysPaged: [Getter],
        getMetadata: [Getter],
        getPairs: [Getter],
        getReadProof: [Getter],
        getRuntimeVersion: [Getter],
        getStorage: [Getter],
        getStorageHash: [Getter],
        getStorageSize: [Getter],
        queryStorage: [Getter],
        queryStorageAt: [Getter],
        traceBlock: [Getter]
      }
    }*/

    // console.log(apiRpc.payment);
    // { queryFeeDetails: [Getter], queryInfo: [Getter] }

    const sampleExtrinsic = '0xefeb8e4313ac206785b07db79103c7861f17790442fcefb8b4ff5b43c51b4a1b';
    // const rlt = await apiRpc.payment.queryFeeDetails(sampleExtrinsic); // none
    // const rlt = await apiRpc.payment.queryInfo(sampleExtrinsic); // none
    // console.log(rlt);

    // const rlt = await apiRpc.state.call(); // api.rpc.state.call('DappStakingApi_eras_per_build_and_earn_subperiod', ''),
    const rlt = await apiRpc.state.getStorageHash(2, '0xa9b4bded7d42a8d601e01db91da43e3d88804a612a37df973d736f6c8026b45a');
    console.log(rlt);


  } catch (e) {
    console.error(e);
    return [];
  }
}
getApiRpc().catch(console.error).finally(() => process.exit());



