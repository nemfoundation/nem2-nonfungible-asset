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
import { sha3_256 } from 'js-sha3';
import {
    Address,
    NetworkType,
    PublicAccount,
} from 'nem2-sdk';
import { AssetCommand } from './AssetCommand';
import { AssetTransferOwnershipCommand } from './AssetTransferOwnershipCommand';

export class Asset {
    public static create(owner: PublicAccount,
                        source: string,
                        identifier: string,
                        metadata: {[key: string]: string | number | boolean }): Asset {
        const publicKey = Asset.deterministicPublicKey(source, identifier);
        const address = Address.createFromPublicKey(publicKey, owner.address.networkType);
        return new Asset(publicKey, address, owner, source, identifier, metadata, [], owner.address.networkType);
    }

    public static deterministicPublicKey(source: string, identifier: string): string {
        return sha3_256(source + identifier).toUpperCase();
    }

    constructor(public readonly publicKey: string,
                public readonly address: Address,
                public readonly owner: PublicAccount,
                public readonly source: string,
                public readonly identifier: string,
                public readonly metadata: { [key: string]: string | number | boolean },
                public readonly commands: AssetCommand[],
                public readonly networkType: NetworkType) {
        Object.keys(metadata)
            .forEach((key) => {
                if (typeof metadata[key] === 'string'
                    && ((metadata[key] as string).indexOf(',') !== -1
                        || (metadata[key] as string).indexOf(':') !== -1
                        || (metadata[key] as string).indexOf('.') !== -1)) {
                    throw Error(`${key} contains special characters (, or .)`);
                }

                if (("metadata(1):").length + (metadata[key] as string).length > 1024) {
                    throw Error(`metadata with key "${key}" is over 1024 chars`);
                }
            });
    }

    public getMetadata(key: string): string | number | boolean | undefined {
        return this.metadata[key];
    }

    public transferOwnership(newOwner: PublicAccount): Asset {
        return AssetTransferOwnershipCommand.create(this, newOwner).apply();
    }
}
