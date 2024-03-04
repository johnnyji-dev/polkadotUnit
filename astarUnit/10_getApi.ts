import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';

const getApiRpc = async () => {


  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;

    // const api = await api.rpc;
    console.log(await api);


  } catch (e) {
    console.error(e);
    return [];
  }
}
getApiRpc().catch(console.error).finally(() => process.exit());



