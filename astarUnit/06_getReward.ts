import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';

// const getApr = async (): Promise<{ stakerApr: number; bonusApr: number }> => {
const getApr = async () => {
  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;
  try {
  
    // let encodedStr = "0x";
    // encodedStr += api
    // .createType(item.paramType, item.paramValue)
    // .toHex(true)
    // .replace("0x", "");
    const test = await api.rpc.state.call('DappStakingApi_eras_per_build_and_earn_subperiod', '');
    // const test = await api.rpc.state.call('BeneficiaryPayout_dapps_staking', '');

    console.log(test.toHuman());

  } catch (error) {
    return { stakerApr: 0, bonusApr: 0 };
  }
};
getApr().catch(console.error).finally(() => process.exit());