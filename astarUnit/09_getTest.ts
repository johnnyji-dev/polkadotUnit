import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { GenericExtrinsic } from '@polkadot/types/extrinsic';



const transactionPaymentApi_queryFeeDetails = async () => {

  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  const blockHash = await api.rpc.chain.getBlockHash(5799002);
  const signedBlock = await api.rpc.chain.getBlock(blockHash);

  // console.log(signedBlock.toHuman());
  // const blckInfo = signedBlock.toHuman();
  // console.log(blckInfo.block);
  // const extrinsics: GenericExtrinsic = blckInfo.block.extrinsics[4];
  // console.log(extrinsics);
  // console.log(extrinsics.toU8a);

  const extrinsics: GenericExtrinsic = signedBlock.block.extrinsics[4];
  // console.log(extrinsics);
  // console.log(extrinsics.toU8a());
  const extU8a = extrinsics.toU8a()

  const payment = await api.call.transactionPaymentApi.queryFeeDetails(extU8a, extU8a.length);
  // console.log(payment);
  console.log(payment.toHuman());
  /*{
    weight: { refTime: '1,498,195,062', proofSize: '13,303' },
    class: 'Normal',
    partialFee: '75.4350 mSBY'
  }*/
}
transactionPaymentApi_queryFeeDetails().catch(console.error).finally(() => process.exit());




const transactionPaymentApi_queryInfo = async () => { // 예상 수수료

  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  const blockHash = await api.rpc.chain.getBlockHash(5799002);
  const signedBlock = await api.rpc.chain.getBlock(blockHash);

  // console.log(signedBlock.toHuman());
  // const blckInfo = signedBlock.toHuman();
  // console.log(blckInfo.block);
  // const extrinsics: GenericExtrinsic = blckInfo.block.extrinsics[4];
  // console.log(extrinsics);
  // console.log(extrinsics.toU8a);

  const extrinsics: GenericExtrinsic = signedBlock.block.extrinsics[4];
  // console.log(extrinsics);
  // console.log(extrinsics.toU8a());
  const extU8a = extrinsics.toU8a()

  const payment = await api.call.transactionPaymentApi.queryInfo(extU8a, extU8a.length);
  // console.log(payment);
  console.log(payment.toHuman());
  /*{
    weight: { refTime: '1,498,195,062', proofSize: '13,303' },
    class: 'Normal',
    partialFee: '75.4350 mSBY'
  }*/
}
// transactionPaymentApi_queryInfo().catch(console.error).finally(() => process.exit());