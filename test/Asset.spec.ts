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

describe('Asset', () => {
    const network = NetworkType.MIJIN_TEST;
    const owner = PublicAccount.createFromPublicKey(
        '94814F5ACE5FEE9E5C1A97AA2545C5BE74C5D9801F66F1BC61547A7B6549BEBE',
        network,
    );

    it('should accept the source identifier & the asset identifier', () => {
        const asset = Asset.create(
            owner,
            'otherchain',
            '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
            {
                key: 'value',
            },
        );

        expect(asset.owner).to.be.equal(owner);
        expect(asset.publicKey).to.be.equal('1485030412335ACAE6A59E8F5826AA7B7EAA831EAC73FE60E6A00E893A306F71');
        expect(asset.address.plain()).to.be.equal('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA');
        expect(asset.source).to.be.equal('otherchain');
        expect(asset.identifier).to.be.equal('26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6');
        expect(Object.keys(asset.metadata).length).to.be.equal(1);
        expect(asset.metadata).to.be.deep.equal({ key: 'value' });
    });

    it('should return the metadata value', () => {
        const asset = Asset.create(
            owner,
            'otherchain',
            '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
            {
                key: 'value',
            },
        );

        expect(asset.getMetadata('key')).to.be.equal('value');
    });

    ['value,', 'value.', ',', '.', ',.value', ':'].forEach((input) => {
        it(`throw Error when the string contains invalid char input=${input}`, () => {
            expect(() => Asset.create(
                owner,
                'otherchain',
                '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
                {
                    key: input,
                },
            )).to.throw(Error);
        });
    });

    it('should transfer the ownership', () => {
        // Arrange
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

        // Act
        const newAsset = asset.transferOwnership(newOwner);

        // Assert
        expect(newAsset.owner).to.be.equal(newOwner);
        expect(newAsset.commands).to.have.length(1);
        expect(newAsset.commands[0].isPersisted()).to.be.false;
    });

    it('meta data should accept float numbers', () => {
        const asset = Asset.create(
            owner,
            'otherchain',
            '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
            {
                'identifier': 12312313.34343433434
            },
        );
        expect(asset.getMetadata('identifier')).to.be.equal(12312313.34343433434); 
    });

    it('should throw Error on a long, single piece of metadata', () => {
        expect(() => Asset.create(
            owner,
            'otherchain',
            '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
            {
                key: "lvauuealveevvvluuveeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveeeuuvuellulavueuaelauevvelelavalelelvvelauluuleuaueeevlvveevevllvuvleluaaavvvaevaulvvuaaelvulvluvleavaleuvvvuleuvuaeueevaveuaaeeeeevalvvlaealuvuveluuavleaalelaeuevvvvaauuavlleeuualelullvalulleavuvvuevlvaeuvluuelaleleluvvaeevlvevuveeuaevlvaavvulvaeavaaueavelelevavueaalvavluelaaveaeulueevuaeavaulllvlavveuevaelleveuvluuvluevalvaavvleelllauuuvleeeleuauaaeleulvvaveaeuaavvalevvueeuulvelevulvuaelueuelaeuvluueaeulvuvelvulveaevvvelualuulvalalaveveuuvuuvllaluaeluualvauevvuluueealauaeellaeuaaeevleululallaeaulluvaavvlvluuuvuaaelveevuveaavuuelaealuuuaevluveleuuveaelvvuluvuuueveellaeluaaelvvavvueauaueuaeuvevalleeaueuvleulaeaeueullaueeuueeleuvvuvavvauvaevvvealvaaveueluaaeuveeeluluvalvveeealevaauelevavvuavleuvaleuvvlleevvulvlavueaelevaelaavvuueevueeulavavvlvluualvallveavelluluvueelvvvaualevuueaeaeuaaeuuvaeevulaveuvuvavauueeeuveaeeueeaaaveuaelavaeauevavvavaaueaveuvulveaueveaauuaualevleauvulevlvuvuvlvalealueuvueevvveueulllalllveeua",
            },
        )).to.throw(Error);
    });

});
