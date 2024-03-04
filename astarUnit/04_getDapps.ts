import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { estimatePendingRewards, fetchRewardsDistributionConfig, fmtAmtFromKSeparator, getDappAddressEnum, hasProperty, removeKSeparator } from '@astar-network/astar-sdk-core';
import { Option, StorageKey, u32, u128, Bytes } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { ethers } from 'ethers';
// import { shibuDappList } from './shibu-dapps';
// import { astarDappList } from './astar-dapps';
// import { shibuDappRegiList } from './shibu-dappRegi';
import { shibuDappRegiList } from './shibu-dappRegi';


import { DappInfo, PalletDappStakingV3DAppInfo, RegisteredDapp, SmartContract, SmartContractAddress, SmartContractState } from './interfaces';

const testAcnt1 = 'bHkgWQw7eSx1zn2kv5Z9EXMhx7ecS3BmP3dEL6MhrcgodiC';
const testAcnt2 = 'XJK8XsYuVaLH9L4yetkyRtDi1GKJteyRJbWtTmgphMgu5m8';
const testAcnt3 = 'X64MTWdusk3Ey3WdAh5L5ygn1HhYjrUG4a6tuo3jKkCbT7C';

const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

const getList = async () => {
  // const list = shibuDappList;
  // const list = astarDappList;
  const list = shibuDappRegiList;
  console.log(list.length)
}
// getList().catch(console.error).finally(() => process.exit());
const getChainDapps = async () => {

  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  // const api = await this.api.getApi();
  const dapps = await api.query.dappStaking.integratedDApps.entries();

  /* trial
  const result: DappInfo[] = [];

  dapps.forEach(([key, value]) => {
    const v = <Option<PalletDappStakingV3DAppInfo>>value;
    const address = getContractAddress(key.args[0] as unknown as SmartContractAddress);

    if (v.isSome) {
      const unwrappedValue = v.unwrap();

      if (address) {
        result.push(this.mapDapp(unwrappedValue, address));
      }
    }
  });*/



  // console.log(dapps[0]);
  const result: SmartContract[] = [];
  dapps.forEach(([key, value]) => {
    const v = <Option<RegisteredDapp>>value;
    const address = getContractAddress(key.args[0] as unknown as SmartContractAddress);
    let developer = '';
    let state = SmartContractState.Unregistered;

    // console.log(v.toHuman());
    if (v.isSome) {
      const unwrappedValue = v.unwrap();
      console.log(unwrappedValue.toHuman());
      developer = String(
        // true ? unwrappedValue.owner?.toString() : unwrappedValue.developer?.toString()
        unwrappedValue.owner?.toString()
      );
      // console.log(unwrappedValue.toHuman());
      // console.log(unwrappedValue.state?.isUnregistered);
      state = unwrappedValue.state?.isUnregistered
        ? SmartContractState.Unregistered
        : SmartContractState.Registered;
    }

    if (address) {
      // console.log(address);
      result.push(new SmartContract(address, developer, state));
    }
  });

  console.log(result.length);
}
getChainDapps().catch(console.error).finally(() => process.exit());
function getContractAddress(address: SmartContractAddress): string | undefined {
  if (address.isEvm) {
    return address?.asEvm?.toString();
  } else if (address.isWasm) {
    return address?.asWasm?.toString();
  } else {
    return undefined;
  }
}
function mapDapp(dapp: PalletDappStakingV3DAppInfo, address: string): DappInfo {
  return {
    address,
    owner: dapp.owner.toString(),
    id: dapp.id.toNumber(),
    state: DappState.Registered, // All dApss from integratedDApps are registered.
    rewardDestination: dapp.rewardBeneficiary.unwrapOr(undefined)?.toString(),
  };
}