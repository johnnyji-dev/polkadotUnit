import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';

// const staker = 'aa39kHzfxnJdVRzdrkW5m4rA6rGjEBJtvG5egiGjHPs5QNN';
// const blockNumber = '5271965';
// 2784380612506679000 // https://astar.subscan.io/extrinsic/0x6a719679f96972587fa89cb73975d4e328898e8010a911f26a07fe80a2eb1992

// const staker = 'bHkgWQw7eSx1zn2kv5Z9EXMhx7ecS3BmP3dEL6MhrcgodiC';
// const blockNumber = '5799002';
// 639824301878549900 // https://shibuya.subscan.io/extrinsic/5799002-4?event=5799002-27
const hash = '0x16378a2c35f92d7614dc454305c2db67ca8e14073b9f2e5bb2cc9610f7a1c3da';

// const getApr = async (): Promise<{ stakerApr: number; bonusApr: number }> => {
const getSubscanFinalUsedFee = async (hash: string) => {
  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  // const api = new ApiPromise({ provider });
  // await api.isReady;
  try {

    // # subscanEndpoint: 'https://astar.api.subscan.io/api/scan/account/reward_slash'
    // subscanEndpoint: 'https://shibuya.api.subscan.io/api/scan/account/reward_slash'
    // subscanApiKey: '15fbe4fd75314c32bb23fe18a5ec7cd3'

    // const response = await fetch(`https://astar.api.subscan.io/api/scan/extrinsic`, {
    const response = await fetch(`https://shibuya.api.subscan.io/api/scan/extrinsic`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "X-API-Key": `15fbe4fd75314c32bb23fe18a5ec7cd3`,
      },
      body: JSON.stringify({
          "hash": hash
      }) // https://support.subscan.io/api-4231209
  })

  const jsonData = await response.json();
  console.log(jsonData);
  
  /*let totReward = 0;

  jsonData?.data?.list.map((el, idx) => {
      let elReward: number = 0;
      elReward = Number(el.amount)
      totReward = addNumber(totReward, elReward);
  })
  console.log(totReward);
  */

  } catch (error) {
    return { stakerApr: 0, bonusApr: 0 };
  }
};
getSubscanFinalUsedFee(hash).catch(console.error).finally(() => process.exit());


export function addNumber(x: number, y: number): number {
  return x + y;
}