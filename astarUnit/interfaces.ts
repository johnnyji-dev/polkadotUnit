import { Compact, Struct, Option, u16 } from "@polkadot/types";
import { AccountId, AccountId32 } from "@polkadot/types/interfaces";
import { Codec } from "@polkadot/types/types";

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
interface DappState {
    isUnregistered: boolean;
    asUnregistered: {
        // Memo: era of unregistration
        words: number[];
    };
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