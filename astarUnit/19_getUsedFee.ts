
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import { u8aToHex } from '@polkadot/util';

// const addr = 'a7ZEP29Zk9vrfNWiENXdhLQWxp3yVSvaTBtTcJAkDKHijwX';
// const extrinsicHash = '0x6bcbfeb29a0b75a67cdd73f44ae75bfc2fdcf9a2cf87f4cf1c2c7aa19c786c62';
// const height = '5613066'; // 76362006026544817n : usedFee | 

// const addr = 'aFbMkq3ifVroSjiELXxEkbWgdBuNDE5XG2LMQDUBak8rQup';
// const extrinsicHash = '0x6708e718f50eecd13f981408504691d7ddc5de26c97a36208701f62b66aa7067';
// const height = '5683437'; // 67914633517860183n : usedFee | 

const extrinsicHash = '0x72278ddd03d651f033e1d3adb290141f17522bdcdc2a417d5239f82ae4ed833b';
const height = '5683405'; // 44144051160013336n : usedFee | 

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
    
    console.log(extrinsicIndex)
    console.log('\n === === \n');

    if (extrinsicIndex === -1) {
        throw new Error('Extrinsic not found in the block');
    }

    // Get events associated with the extrinsic
    const extrinsicEvents = allRecords.filter((record) =>
        record.phase.isApplyExtrinsic &&
        record.phase.asApplyExtrinsic.eq(extrinsicIndex)
    );

    const method = 'TransactionFeePaid';
    const section = 'transactionPayment';

    let usedFee = BigInt('0');
  
    extrinsicEvents.map((e, idx) => {
      console.log(e.toHuman(), idx);
      if ( e.toHuman()?.event?.method == method &&
            e.toHuman()?.event?.section == section) {
          let tmpUsedFee = e.toHuman().event?.data?.actualFee;
          let tmpUsedFeeBigInt = commaStrToBigInt(tmpUsedFee);

          // let tmpTip = e.toHuman().event?.data?.tip;
          // let tmpTipBigInt = commaStrToBigInt(tmpTip);

          // usedFee = tmpUsedFeeBigInt - tmpTipBigInt; // subscan amount
          usedFee = tmpUsedFeeBigInt; // acutal calculated amount (0.000,000,000,000,0xx,xxx 오차 존재)
          /**
           * TestEnv) shibuya-testnet
           * Txhash) https://shibuya.subscan.io/extrinsic/0x8237b4ad0a8a35d02f176973463342f801a3906beda8b7ba1cae7a0e011e7de7
           * BeforeTx) balance : 81.556,147,135,051,894,113
           * After-Tx) balance : 81.488,571,369,443,536,033 realFee : 0.067,575,765,608,300,600
           * EventDt-acutalFee) e.toHuman().event?.data?.actualFee => 0.067,575,765,608,358,080
           * EventDt-tip)             e.toHuman().event?.data?.tip => 0.000,779,371,350,051,000
           * Subscan-UsedFee)  [EventDt-acutalFee] - [EventDt-tip] => 0.066,796,394,258,307,080
           */

      } else {
          usedFee = usedFee;
      }
    })

    console.log('\n === === \n');
    console.log(usedFee);
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