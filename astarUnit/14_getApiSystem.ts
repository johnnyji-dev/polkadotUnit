import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';

const getApiQuery = async () => {


  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;


    const apiSystem = await api.system;
    console.log(apiSystem);
    
  
  } catch (e) {
    console.error(e);
    return [];
  }
}
getApiQuery().catch(console.error).finally(() => process.exit());