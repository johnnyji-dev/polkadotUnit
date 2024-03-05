import { WsProvider } from '@polkadot/rpc-provider';
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api';
import { estimatePendingRewards, fetchRewardsDistributionConfig, fmtAmtFromKSeparator, getDappAddressEnum, hasProperty, removeKSeparator } from '@astar-network/astar-sdk-core';
import { Option, StorageKey, u32, u128, Bytes } from '@polkadot/types';
import { Codec } from '@polkadot/types/types';
import { ethers } from 'ethers';

import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';


import { CombinedDappInfo, DappBase, DappInfo, DappState, PalletDappStakingV3DAppInfo, ProviderDappData, RegisteredDapp, SmartContract, SmartContractAddress, SmartContractState } from './interfaces';
import axios from 'axios';

const testAcnt1 = 'bHkgWQw7eSx1zn2kv5Z9EXMhx7ecS3BmP3dEL6MhrcgodiC';
const testAcnt2 = 'XJK8XsYuVaLH9L4yetkyRtDi1GKJteyRJbWtTmgphMgu5m8';
const testAcnt3 = 'X64MTWdusk3Ey3WdAh5L5ygn1HhYjrUG4a6tuo3jKkCbT7C';

const dappAddress = '0xc25d089a9b7bfba1cb10b794cd20c66ec1a9c712';

const getDappsRepo = async (network: string): Promise<DappBase[]> => {

  const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
  const response = await axios.get<DappBase[]>(url);

  // console.log('\n ===== getDappsRepo ===== \n');
  // console.log(response.data)
  // console.log(response.data.length)
  // console.log('\n ===== getDappsRepo ===== \n');
  return response.data;
}
// getDappsRepo('astar').catch(console.error).finally(() => process.exit());
// getDappsRepo('shibuya').catch(console.error).finally(() => process.exit());
const getChainDapps = async (): Promise<DappInfo[]> => {
  // const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  // const api = await this.api.getApi();
  const dapps = await api.query.dappStaking.integratedDApps.entries();
  const result: DappInfo[] = [];

  dapps.forEach(([key, value]) => {
    const v = <Option<PalletDappStakingV3DAppInfo>>value;
    const address = getContractAddress(key.args[0] as unknown as SmartContractAddress);

    if (v.isSome) {
      const unwrappedValue = v.unwrap();

      if (address) {
        result.push(mapDapp(unwrappedValue, address));
      }
    }
  });

  // console.log('\n ===== getChainDapps ===== \n');
  // console.log(result);
  // console.log(result.length);
  // console.log('\n ===== getChainDapps ===== \n');
  return result;
}
// getChainDapps().catch(console.error).finally(() => process.exit());
const getDappsTknRepo = async (network: string): Promise<ProviderDappData[]> => {

  const dappsUrl = `${TOKEN_API_URL}/v3/${network.toLowerCase()}/dapps-staking/chaindapps`;
  try {
    const dapps = await axios.get<ProviderDappData[]>(dappsUrl);
    // console.log(dapps.data)
    // console.log(dapps.data.length)
    // dapps.data.map((e) => {
    //   e.state != 'Registered' ? console.log(e) : console.log('Reg')
    // })
    return dapps.data;
  } catch (error) {
    console.error(error);
  }

  return [];
}
// getDappsTknRepo('astar').catch(console.error).finally(() => process.exit());
// getDappsRepo('shibuya').catch(console.error).finally(() => process.exit());


// @inheritdoc
const getDapps = async (
  network: string
): Promise<{ fullInfo: CombinedDappInfo[]; chainInfo: DappInfo[] }> => {

  const [storeDapps, chainDapps, tokenApiDapps] = await Promise.all([
    // this.dappStakingRepository.getDappsRepo(network.toLowerCase()),
    // this.dappStakingRepository.getChainDapps(),
    // this.tokenApiRepository.getDapps(network.toLowerCase()),
    getDappsRepo(network.toLowerCase()),
    getChainDapps(),
    getDappsTknRepo(network.toLowerCase()),
  ]);

  // Map on chain and in store dApps (registered only)
  const dApps: CombinedDappInfo[] = [];
  const onlyChain: DappInfo[] = [];
  chainDapps.forEach((chainDapp) => {
    const storeDapp = storeDapps.find(
      (x) => x.address.toLowerCase() === chainDapp.address.toLowerCase()
    );
    const dappDetails = tokenApiDapps.find(
      (x) => x.contractAddress.toLowerCase() === chainDapp.address.toLowerCase()
    );
    if (storeDapp) {
      dApps.push({
        basic: storeDapp,
        chain: chainDapp,
        dappDetails,
      });
    } else {
      onlyChain.push(chainDapp);
    }
  });

  // Map unregistered dApps
  /*tokenApiDapps
    .filter((x) => x.state === 'Unregistered')
    .forEach((dapp) => {
      const storeDapp = storeDapps.find(
        (x) => x.address.toLowerCase() === dapp.contractAddress.toLowerCase()
      );
      // console.log(storeDapp)
      if (storeDapp) {
        dApps.push({
          basic: storeDapp,
          dappDetails: dapp,
          chain: {
            address: dapp.contractAddress,
            id: dapp.dappId,
            owner: dapp.owner,
            state: DappState.Unregistered,
          },
        });
      }
    });*/
  //   console.log('\n ===== \n');
  console.log(dApps);
  console.log(dApps.length);
  // console.log('\n ===== \n');
  // console.log(onlyChain);
  // console.log(`${{ fullInfo: dApps, chainInfo: onlyChain }}`);
  return { fullInfo: dApps, chainInfo: onlyChain };
}
// getDapps('astar').catch(console.error).finally(() => process.exit());
getDapps('shibuya').catch(console.error).finally(() => process.exit());








/*
const getRegisteredContract = async (developerAddress: string) => {
  try {
    const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
    // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
    const api = new ApiPromise({ provider });
    await api.isReady;


    const account = api.registry.createType('AccountId32', developerAddress.toString());
    const contractAddress = await api.query.dappsStaking.registeredDevelopers<
      Option<SmartContractAddress>
    >(account);
    return contractAddress.isNone ? undefined : getContractAddress(contractAddress.unwrap());
  } catch (error) {
    return undefined;
  }
}
// getRegisteredContract(developerAddress).catch(console.error).finally(() => process.exit());


const getChainDapps = async () => {

  const provider = new HttpProvider('https://hazel-gondolin-982d6.astar.bdnodes.net/para-http-rpc?auth=KpsskkIce4d-ogsKq42cUirhP29tqwW3bOH4sfpPuJ8');
  // const provider = new HttpProvider('https://shibuya.public.blastapi.io');
  const api = new ApiPromise({ provider });
  await api.isReady;

  // const api = await this.api.getApi();
  const dapps = await api.query.dappStaking.integratedDApps.entries();
  // const dapps = await api.query.dappsStaking.RegisteredDapp;
  console.log(dapps);
  // console.log(dapps[0]);
  let idx = 0;

  const result: SmartContract[] = [];
  dapps.forEach(([key, value]) => {
    // console.log(key.toHuman(), idx);
    // console.log(value.toHuman(), idx++);
    const v = <Option<RegisteredDapp>>value;
    const address = getContractAddress(key.args[0] as unknown as SmartContractAddress);
    let developer = '';
    let state = SmartContractState.Unregistered;

    // console.log(v.toHuman());
    console.log(v.isSome);
    if (v.isSome) {
      const unwrappedValue = v.unwrap();
      console.log(unwrappedValue.toHuman());
      developer = String(
        // true ? unwrappedValue.owner?.toString() : unwrappedValue.developer?.toString()
        unwrappedValue.owner?.toString()
      );
      // console.log(unwrappedValue.state);
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
  // console.log(result);
  console.log(result.length);
}
// getChainDapps().catch(console.error).finally(() => process.exit());
*/


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
