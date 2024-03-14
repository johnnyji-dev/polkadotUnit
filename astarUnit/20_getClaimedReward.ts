
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import { u8aToHex } from '@polkadot/util';

// const addr = 'a7ZEP29Zk9vrfNWiENXdhLQWxp3yVSvaTBtTcJAkDKHijwX';
// const extrinsicHash = '0x6bcbfeb29a0b75a67cdd73f44ae75bfc2fdcf9a2cf87f4cf1c2c7aa19c786c62';
// const height = '5613066'; // 747898314833345721n : reward | 

// const addr = 'aFbMkq3ifVroSjiELXxEkbWgdBuNDE5XG2LMQDUBak8rQup';
// const extrinsicHash = '0x6708e718f50eecd13f981408504691d7ddc5de26c97a36208701f62b66aa7067';
// const height = '5683437'; // 0 : usedFee | 

// const addr = 'aFbMkq3ifVroSjiELXxEkbWgdBuNDE5XG2LMQDUBak8rQup';
const extrinsicHash = '0x72278ddd03d651f033e1d3adb290141f17522bdcdc2a417d5239f82ae4ed833b';
const height = '5683405'; // 15034758499910113461 : usedFee | 

const getApiConst = async (extrinsicHash: string, height: string) => {
  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  try {

    const blockHash = await api.rpc.chain.getBlockHash(height);
    const block = await api.rpc.chain.getBlock(blockHash);
    const apiAt = await api.at(block.block.header.hash);
    const allRecords = (await apiAt.query.system.events()).toArray();

    // Find the extrinsic index by matching the extrinsic hash
    const extrinsicIndex = block.block.extrinsics.findIndex(
      (ex) => ex.hash.toString() === extrinsicHash
    );

    console.log(`extrinsicIndex: ${extrinsicIndex}`);

    if (extrinsicIndex === -1) {
      throw new Error('Extrinsic not found in the block');
    }

    // Get events associated with the extrinsic
    const extrinsicEvents = allRecords.filter((record) =>
      record.phase.isApplyExtrinsic &&
      record.phase.asApplyExtrinsic.eq(extrinsicIndex)
    );

    const method = 'Reward';
    const section = 'dappStaking';

    let claimedReward = BigInt('0');

    extrinsicEvents.map((e, idx) => {
      console.log(e.toHuman(), idx);
      if (e.toHuman()?.event?.method == method &&
        e.toHuman()?.event?.section == section) {
        let tmpAmount = e.toHuman().event?.data?.amount;
        let tmpAmountBigInt = commaStrToBigInt(tmpAmount);

        claimedReward += tmpAmountBigInt;

      } else {
        claimedReward = claimedReward;
      }
    })

    console.log('\n === === \n');
    console.log(claimedReward);
    console.log('\n === === \n');

    return extrinsicEvents;

  } catch (e) {
    console.error(e);
  }
}
getApiConst(extrinsicHash, height).catch(console.error).finally(() => process.exit());


export function commaStrToBigInt(_str: string) {

  let _strToStr = String(_str);
  // console.log(_strToStr);

  let _noCommaStr = _strToStr.replace(/,/g, '');
  // console.log(_noCommaStr);

  let rlt = BigInt("0");

  if (_noCommaStr === "undefined") {
    console.log(' _noCommaStr :undefined ');
  } else {
    rlt = BigInt(_noCommaStr);
  }
  console.log(rlt);

  return rlt;
}