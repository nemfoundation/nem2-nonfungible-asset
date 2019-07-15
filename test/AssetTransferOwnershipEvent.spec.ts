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
import { expect } from 'chai';
import { NetworkType, PublicAccount } from 'nem2-sdk';
import { Asset } from '../index';
import { AssetTransferOwnershipCommand } from '../index';

describe('AssetTransferOwnershipCommand', () => {
    const network = NetworkType.MIJIN_TEST;
    const owner = PublicAccount.createFromPublicKey(
        '94814F5ACE5FEE9E5C1A97AA2545C5BE74C5D9801F66F1BC61547A7B6549BEBE',
        network,
    );
    const newOwner = PublicAccount.createFromPublicKey(
        '324E154A02A9037F61118A6C11D4CDD4B63A48545CDDC5E1F0C0A02E88154FA5',
        NetworkType.MIJIN_TEST,
    );
    const asset = Asset.create(
        owner,
        'otherchain',
        '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
        {},
    );

    it('should change the owner of the asset', () => {
        // Act
        const newAsset = asset.transferOwnership(newOwner);

        // Assert
        expect(newAsset.owner).to.be.equal(newOwner);
        expect(newAsset.commands).to.have.length(1);
        expect(newAsset.commands[0].isPersisted()).to.be.false;
        expect(() => newAsset.commands[0].evidence()).to.throw('evidence not present');
    });

    it('should return the descriptor', () => {
        expect(AssetTransferOwnershipCommand.descriptor()).to.be.equal('asset_command(transfer_ownership,1):');
    });

    [
        'asset_command(transfer_ownership,1):324E154A02A9037F61118A6C11D4CDD4B63A48545CDDC5E1F0C0A02E88154FA5',
        'asset_command(transfer_ownership,1):324e154a02a9037f61118a6c11d4cdd4b63a48545cddc5e1f0c0a02e88154fa5',
    ].forEach((input) => {
        it(`isCommand given ${input} should return true`, () => {
            expect(AssetTransferOwnershipCommand.isCommand(input)).to.be.true;
        });
    });

    [
        'asset_command(transfer_ownership,1):z24e154a02a9037f61118a6c11d4cdd4b63a48545cddc5e1f0c0a02e88154fa5',
        'asset_command(transfer_ownership,1)',
        'it does not start by asset_command(transfer_ownership,1)',
        'asset_command(xransfer_ownership,1):324e154a02a9037f61118a6c11d4cdd4b63a48545cddc5e1f0c0a02e88154fa5',
    ].forEach((input) => {
        it(`isCommand given ${input} should return false`, () => {
            expect(AssetTransferOwnershipCommand.isCommand(input)).to.be.false;
        });
    });

    it('should change the owner of the asset given a command descriptor', () => {
        // Act
        const newAsset = AssetTransferOwnershipCommand.readAndApply(
            'asset_command(transfer_ownership,1):324E154A02A9037F61118A6C11D4CDD4B63A48545CDDC5E1F0C0A02E88154FA5',
            asset,
        );

        // Assert
        expect(newAsset.owner).to.be.deep.equal(newOwner);
        expect(newAsset.commands).to.have.length(1);
        expect(newAsset.commands[0].isPersisted()).to.be.false;
    });

    it('should throw error when trying to apply a non valid command descriptor', () => {
        // Assert
        expect(() => {
            AssetTransferOwnershipCommand.readAndApply(
                ',:324E154A02A9037F61118A6C11D4CDD4B63A48545CDDC5E1F0C0A02E88154FA5',
                asset,
            );
        }).to.throw('commandDescriptor is not of AssetTransferOwnershipCommand type');
    });

    it('should return the command descriptor', () => {
        // Act
        const command = AssetTransferOwnershipCommand.create(asset, newOwner);

        // Assert
        expect(command.toDTO()).to.be.equal(
            'asset_command(transfer_ownership,1):324E154A02A9037F61118A6C11D4CDD4B63A48545CDDC5E1F0C0A02E88154FA5',
        );
    });
});
