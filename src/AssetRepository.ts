/*
 * Copyright (c) 2018 NEM Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
 * THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import {
    AccountHttp,
    AccountInfo,
    Address,
    AggregateTransaction,
    BlockchainHttp,
    Deadline,
    NetworkType,
    PlainMessage,
    Transaction,
    TransactionType,
    TransferTransaction
} from 'nem2-sdk';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Asset } from './Asset';

export class AssetRepository {
    public static readonly ASSET_PREFIX = 'asset(1):'; // (1) means version 1
    public static readonly METADATA_PREFIX = 'metadata(1):';

    public static publish(asset: Asset, deadline: Deadline = Deadline.create()): AggregateTransaction {
        const assetDefinition = TransferTransaction.create(
            deadline,
            asset.address,
            [],
            PlainMessage.create(`${this.ASSET_PREFIX}${asset.source},${asset.identifier}`),
            asset.networkType,
        );
        const innerTransactions = [
            assetDefinition.toAggregate(asset.owner),
        ];

        if (asset.metadata.length !== 0) {
            const metadata = Object.keys(asset.metadata)
                .map((key): string => `${key};${asset.metadata[key]}`);
            let chunkedMetaData: Array<string> = [];
            let chunk: string = "";
            const messageLength: number = 1024;
            if ((this.METADATA_PREFIX.length) + metadata.join('|').length > messageLength) {
                metadata.map((data) => {
                    if ((this.METADATA_PREFIX.length) + chunk.length + (data + '|').length >= messageLength) {
                        chunkedMetaData.push(chunk);
                        chunk = "";
                    }
                    if (chunk.length != 0) {
                        chunk += '|';
                    }
                    chunk += data;
                });
                chunkedMetaData.push(chunk);
                chunkedMetaData.map((data) => {
                    innerTransactions.push(
                        TransferTransaction.create(
                            deadline,
                            asset.address,
                            [],
                            PlainMessage.create(`${this.METADATA_PREFIX}${data}`),
                            asset.networkType,
                        ).toAggregate(asset.owner),
                    );
                });

                console.log(chunkedMetaData)
            }

            else {
                innerTransactions.push(
                    TransferTransaction.create(
                        deadline,
                        asset.address,
                        [],
                        PlainMessage.create(`${this.METADATA_PREFIX}${metadata.join('|')}`),
                        asset.networkType,
                    ).toAggregate(asset.owner),
                );
            }
        }
        const transaction = AggregateTransaction.createComplete(
            deadline,
            innerTransactions,
            asset.networkType,
            [],
        );

        return transaction;
    }

    constructor(private readonly accountRepository: AccountHttp,
                private readonly blockRepository: BlockchainHttp,
                private readonly networkType: NetworkType) {
    }

    public byAssetIdentifier(source: string, identifier: string): Observable<Asset> {
        const publicKey = Asset.deterministicPublicKey(source, identifier);
        const address = Address.createFromPublicKey(
            publicKey,
            this.networkType);

        return this.byAddress(address);
    }

    public byPublicKey(publicKey: string): Observable<Asset> {
        const address = Address.createFromPublicKey(
            publicKey,
            this.networkType);

        return this.byAddress(address);
    }

    public byAddress(address: Address): Observable<Asset> {
        return of(address).pipe(
            mergeMap<Address, AccountInfo>((addr: Address): Observable<AccountInfo> =>
                this.accountRepository.getAccountInfo(addr)),
            mergeMap<AccountInfo, Transaction[]>((account: AccountInfo): Observable<Transaction[]> =>
                this.blockRepository.getBlockTransactions(account.addressHeight.compact()),
            ),
            map((txs: Transaction[]) => {
                const transactions = txs
                    .filter((tx) => tx.type === TransactionType.AGGREGATE_BONDED
                        || tx.type === TransactionType.AGGREGATE_COMPLETE)
                    .map((tx) => tx as AggregateTransaction)
                    .filter((tx) => firstInnerTxTransferAndReceiver(tx, address));
                if (transactions.length !== 1) {
                    throw new Error(`Account ${address.pretty()} is not an asset`);
                }
                const assetDefinitionTx = transactions[0];
                const message = (assetDefinitionTx.innerTransactions.shift() as TransferTransaction)
                    .message as PlainMessage;
                if (message.payload.substring(0, AssetRepository.ASSET_PREFIX.length) !== AssetRepository.ASSET_PREFIX) {
                    throw new Error(`First message in account is not an ${AssetRepository.ASSET_PREFIX} prefix`);
                }
                const [messageSource, messageIdentifier] = assetIdentifierDefinition(message.payload);
                const publicKey = Asset.deterministicPublicKey(messageSource, messageIdentifier);

                if (!Address.createFromPublicKey(publicKey, this.networkType).equals(address)) {
                    Observable.throw('Invalid asset');
                }

                const metadata: { [key: string]: string | number | boolean } =
                    extractMetadata(assetDefinitionTx
                        .innerTransactions
                        .filter((x) => x.type === TransactionType.TRANSFER)
                        .map((x) => x as TransferTransaction)
                        .map((x) => x.message.payload));

                return new Asset(
                    publicKey,
                    address,
                    assetDefinitionTx.signer!,
                    messageSource,
                    messageIdentifier,
                    metadata,
                    [],
                    this.networkType,
                );
            }));
    }
}

const firstInnerTxTransferAndReceiver = (aggregateTx: AggregateTransaction, receiver: Address): boolean => {
    if (aggregateTx.innerTransactions[0].type !== TransactionType.TRANSFER) {
        return false;
    }
    return (aggregateTx.innerTransactions[0] as TransferTransaction).recipient.equals(receiver);
};

const assetIdentifierDefinition = (message: string) => {
    const messageSource = message.split(',')[0].substring(AssetRepository.ASSET_PREFIX.length);
    const messageIdentifier = message.split(',')[1];
    return [messageSource, messageIdentifier];
};

export const extractMetadata = (payload: string[]): { [key: string]: string | boolean | number } => {
    const partial: Array<{ [key: string]: string | boolean | number }> = payload
        .filter((mss: string) => mss.substring(0, AssetRepository.METADATA_PREFIX.length) === AssetRepository.METADATA_PREFIX)
        .map((mss) => mss.substring(AssetRepository.METADATA_PREFIX.length))
        .map((mss) => mss.split('|'))
        .map((rawMetadata: string[]) => {
            const innerMetadata: { [key: string]: string | boolean | number } = {};
            rawMetadata.forEach((x) => {
                const splitPair = x.split(';');
                let value: string | boolean | number;
                if (!isNaN(Number(splitPair[1]))) {
                    value = Number(splitPair[1]);
                } else if (parseBoolean(splitPair[1]) !== undefined) {
                    value = parseBoolean(splitPair[1])!!;
                } else {
                    value = splitPair[1];
                }
                innerMetadata[splitPair[0]] = value;
            });
            return innerMetadata;
        });
    const metadata: {[key: string]: string | boolean | number} = {};
    partial.forEach((notMerged) => {
        Object.keys(notMerged).forEach((key) => {
            metadata[key] = notMerged[key];
        });
    });
    return metadata;
};

const parseBoolean = (input: string): boolean | undefined => {
    if (input.toLowerCase() === 'true') {
        return true;
    } else if (input.toLowerCase() === 'false') {
        return false;
    }
    return undefined;
};
