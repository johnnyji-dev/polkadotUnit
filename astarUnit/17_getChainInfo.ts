import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';



const getChainInfo = async () => {

  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  const main = 'Astar';
  const test = 'Shibuya';
  const result: string = await api.rpc.system.chain.raw();
  console.log(result);
  // console.log(result.toString().split(' ', 0));
  // Shibuya Testnet // Astar
  // result.includes(main) ? console.log('Y') : console.log('N');
  result.includes(test) ? console.log('Y') : console.log('N');

}
getChainInfo().catch(console.error).finally(() => process.exit());