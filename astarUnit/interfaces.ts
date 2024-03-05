import { Compact, Struct, Option, u16 } from "@polkadot/types";
import { AccountId, AccountId32 } from "@polkadot/types/interfaces";
import { Codec } from "@polkadot/types/types";
import { Community } from '@astar-network/astar-sdk-core';

export class SmartContract {
    constructor(
        public address: string,
        public developerAddress: string,
        public state: SmartContractState
    ) { }
}
export enum SmartContractState {
    Registered = 'Registered',
    Unregistered = 'Unregistered',
}
export interface RegisteredDapp extends Struct {
    readonly developer?: AccountId;
    readonly owner?: AccountId;
    readonly state: DappState;
}
// interface DappState {
//     isUnregistered: boolean;
//     asUnregistered: {
//         // Memo: era of unregistration
//         words: number[];
//     };
// }

export enum DappState {
    Registered = 'Registered',
    Unregistered = 'Unregistered',
}

export interface SmartContractAddress extends Struct {
    isEvm: boolean;
    asEvm?: Codec;
    isWasm: boolean;
    asWasm?: Codec;
}
export interface PalletDappStakingV3DAppInfo extends Struct {
    readonly owner: AccountId32;
    readonly id: Compact<u16>;
    readonly rewardBeneficiary: Option<AccountId32>;
}
export interface DappInfo {
    address: string;
    owner: string;
    id: number;
    state: DappState;
    rewardDestination?: string;
    stakeVoting?: bigint;
    stakeBuildAndEarn?: bigint;
    totalStake?: bigint;
}

export interface CombinedDappInfo {
    basic: DappBase;
    extended?: Dapp;
    chain: DappInfo;
    dappDetails?: ProviderDappData;
}

export interface DappBase {
    address: string;
    name: string;
    description: string;
    iconUrl: string;
    mainCategory?: string;
    creationTime: number;
    shortDescription: string;
    url: string;
    imagesUrl: string[];
}

export interface Dapp extends DappBase {
    tags: string[];
    developers: Developer[];
    communities: Community[];
    contractType: string;
    license: string;
}

export interface Developer {
    githubAccountUrl: string;
    twitterAccountUrl: string;
    linkedInAccountUrl: string;
    iconFile: string;
    name: string;
}

export interface ProviderDappData {
    contractAddress: string;
    stakersCount: number;
    registeredAt: number;
    registrationBlockNumber: number;
    unregisteredAt?: number;
    unregistrationBlockNumber?: number;
    owner: string;
    beneficiary?: string;
    state: DappState;
    dappId: number;
}