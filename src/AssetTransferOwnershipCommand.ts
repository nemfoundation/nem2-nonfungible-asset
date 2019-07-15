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
import { NetworkType, PublicAccount } from 'nem2-sdk';
import { Asset } from './Asset';
import { AssetCommand } from './AssetCommand';
import { Evidence } from './Evidence';

export class AssetTransferOwnershipCommand extends AssetCommand {
    public static create(asset: Asset, newOwner: PublicAccount): AssetTransferOwnershipCommand {
        return new AssetTransferOwnershipCommand(asset, newOwner, undefined);
    }

    /**
     * @returns the command descriptor to be read later
     */
    public static descriptor(): string {
        return 'asset_command(transfer_ownership,1):';
    }

    /**
     * given a message, it returns true when the AssetCommand is able to apply the logic, otherwise false.
     * @param commandDescriptor message
     * @returns true when the commandDescriptor is of the AssetCommand
     */
    public static isCommand(commandDescriptor: string): boolean {
        const descriptor = AssetTransferOwnershipCommand.descriptor();
        const descriptorLength = descriptor.length;
        if (commandDescriptor.length !== descriptorLength + 64) {
            return false;
        }
        if (commandDescriptor.substr(0, descriptorLength).indexOf(descriptor) === -1) {
            return false;
        }
        try {
            // Using MIJIN_TEST as network because it doesn't matter.
            AssetTransferOwnershipCommand.extractPublicAccount(commandDescriptor, NetworkType.MIJIN_TEST);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * returns the instance of AssetCommand ready
     * @param commandDescriptor message with the command information
     * @param asset asset to apply the AssetCommand logic
     * @returns the asset after apply the logic
     */
    public static readAndApply(commandDescriptor: string, asset: Asset): Asset {
        if (!AssetTransferOwnershipCommand.isCommand(commandDescriptor)) {
            throw new Error('commandDescriptor is not of AssetTransferOwnershipCommand type');
        }
        const newOwner = AssetTransferOwnershipCommand.extractPublicAccount(commandDescriptor, asset.networkType);
        return AssetTransferOwnershipCommand.create(asset, newOwner).apply();
    }

    /**
     * it expects to contain the descriptor.
     * @param commandDescriptor
     */
    private static extractPublicAccount(commandDescriptor: string, networkType: NetworkType): PublicAccount {
        const descriptorLength = AssetTransferOwnershipCommand.descriptor().length;
        return PublicAccount.createFromPublicKey(
            commandDescriptor.substr(descriptorLength),
            networkType,
        );
    }

    /**
     * @internal
     * @param asset
     * @param newOwner
     * @param evidence
     */
    constructor(public readonly asset: Asset,
                public readonly newOwner: PublicAccount,
                evidence?: Evidence) {
        super(evidence);
    }

    public apply(): Asset {
        return new Asset(
            this.asset.publicKey,
            this.asset.address,
            this.newOwner,
            this.asset.source,
            this.asset.identifier,
            this.asset.metadata,
            this.asset.commands.concat(this),
            this.asset.networkType,
        );
    }

    public toDTO(): string {
        return AssetTransferOwnershipCommand.descriptor() + this.newOwner.publicKey;
    }
}
