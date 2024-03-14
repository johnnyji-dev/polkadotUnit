
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';
import { u8aToHex } from '@polkadot/util';



const getApiConst = async () => {
  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  try {
    const addr = 'a7ZEP29Zk9vrfNWiENXdhLQWxp3yVSvaTBtTcJAkDKHijwX';
    const extrinsicHash = '0x93b1fd62c3f2222d618753e92c6fe14858da0a96d63b3b32d047d1ae6f0df7a2';
    // const height = '5628041'; //       actualFee: '76,409,006,026,544,817',
    // const height = '5613066'; //      actualFee: '76,362,006,026,544,817',
    // const height = '5613067'; //      actualFee: '76,362,006,026,544,817',
    const height = '5577909'; //      actualFee: '76,362,006,026,544,817',

    /*
    const blockHash = await api.rpc.chain.getBlockHash(height);
    console.log(blockHash.toHuman()); // 0x5016239bfb1d3166357b4715573a0d5a426db585e2518b3cf894a27c245fdc3f
    console.log('\n === === \n');
    const signedBlock = await api.rpc.chain.getBlock(blockHash);
    console.log(signedBlock.toHuman());
    console.log('\n === === \n');
    console.log(signedBlock?.block?.extrinsics?.toHuman());
    console.log('\n === === \n');
    console.log(signedBlock?.block?.extrinsics[2].hash.toHuman());
    // 0x93b1fd62c3f2222d618753e92c6fe14858da0a96d63b3b32d047d1ae6f0df7a2
    console.log('\n === === \n');
    // const apiAt = await api.at(signedBlock.block.header.hash);
    const apiAt = await api.at(signedBlock?.block?.extrinsics[2].hash);
    console.log(apiAt);
    */

    const blockHash = await api.rpc.chain.getBlockHash(height);
    const block = await api.rpc.chain.getBlock(blockHash);
    // const { events } = await api.query.system.events.at(blockHash);
    const apiAt = await api.at(block.block.header.hash);
    const allRecords = (await apiAt.query.system.events()).toArray();
    // let eventList = [];

    allRecords.find((e, idx) => {
      console.log(e.toHuman(), idx++);
    })
    console.log('\n === === \n');

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
    // const extrinsicEvents = events.filter((record) =>
        record.phase.isApplyExtrinsic &&
        record.phase.asApplyExtrinsic.eq(extrinsicIndex)
    );

  
    extrinsicEvents.find((e, idx) => {
      console.log(e.toHuman(), idx++);
    })
    console.log('\n === === \n');

    return extrinsicEvents;

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