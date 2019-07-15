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
import {
    AccountHttp,
    AccountInfo,
    Address,
    AggregateTransaction,
    BlockchainHttp,
    Deadline,
    NetworkType,
    PlainMessage,
    PublicAccount,
    TransactionType,
    TransferTransaction,
    UInt64,
} from 'nem2-sdk';
import { of } from 'rxjs';
import * as TypeMoq from 'typemoq';
import { Asset, AssetRepository } from '../index';

describe('AssertRepository', () => {
    // Constants
    const network = NetworkType.MIJIN_TEST;
    const owner = PublicAccount.createFromPublicKey(
        '94814F5ACE5FEE9E5C1A97AA2545C5BE74C5D9801F66F1BC61547A7B6549BEBE',
        network,
    );
    const asset = Asset.create(
        owner,
        'otherchain',
        '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
        {
            key: 'value',
        },
    );

    // Mocks
    let accountHttpMock: TypeMoq.IMock<AccountHttp>;
    let blockchainHttpMock: TypeMoq.IMock<BlockchainHttp>;

    beforeEach(() => {
        accountHttpMock = TypeMoq.Mock.ofType(AccountHttp);
        blockchainHttpMock = TypeMoq.Mock.ofType(BlockchainHttp);
    });

    it('should publish an asset as AggregateTx', () => {
        const transaction = AssetRepository.publish(asset);
        const assetDefinition = (transaction.innerTransactions[0] as TransferTransaction).message as PlainMessage;
        const metadata = (transaction.innerTransactions[1] as TransferTransaction).message as PlainMessage;
        expect(assetDefinition.payload)
            .to.be.equal('asset(1):otherchain,26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6');
        expect(metadata.payload)
            .to.be.equal('metadata(1):key;value');
    });

    it('should return an asset', () => {
        const address = Address.createFromRawAddress('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA');
        const account = new AccountInfo(
            {},
            address,
            UInt64.fromUint(10),
            '94814F5ACE5FEE9E5C1A97AA2545C5BE74C5D9801F66F1BC61547A7B6549BEBE',
            UInt64.fromUint(10),
            [],
            UInt64.fromUint(0),
            UInt64.fromUint(0),
        );
        const aggregateTransaction = new AggregateTransaction(
            network,
            TransactionType.AGGREGATE_COMPLETE,
            2,
            Deadline.create(),
            UInt64.fromUint(0),
            [
                TransferTransaction.create(
                    Deadline.create(),
                    address,
                    [],
                    PlainMessage.create(
                        'asset(1):otherchain,26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
                    ),
                    network).toAggregate(owner),
            ],
            [],
            undefined,
            owner,
        );

        accountHttpMock.setup((x) => x.getAccountInfo(address)).returns(() => of(account));
        blockchainHttpMock.setup((x) => x.getBlockTransactions(10)).returns(
            () => of([aggregateTransaction]));
        const assetService = new AssetRepository(accountHttpMock.object, blockchainHttpMock.object, network);

        return assetService.byAddress(address)
            .toPromise()
            .then((x) => {
                expect(x.owner).to.be.equal(owner);
                expect(x.publicKey).to.be.equal('1485030412335ACAE6A59E8F5826AA7B7EAA831EAC73FE60E6A00E893A306F71');
                expect(x.address.plain()).to.be.equal('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA');
                expect(x.source).to.be.equal('otherchain');
                expect(x.identifier)
                    .to.be.equal('26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6');
                expect(x.metadata).to.be.deep.equal({});
            });
    });

    it('should return an asset with metadata', () => {
        const address = Address.createFromRawAddress('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA');
        const account = new AccountInfo(
            {},
            address,
            UInt64.fromUint(10),
            '94814F5ACE5FEE9E5C1A97AA2545C5BE74C5D9801F66F1BC61547A7B6549BEBE',
            UInt64.fromUint(10),
            [],
            UInt64.fromUint(0),
            UInt64.fromUint(0),
        );
        const aggregateTransaction = new AggregateTransaction(
            network,
            TransactionType.AGGREGATE_COMPLETE,
            2,
            Deadline.create(),
            UInt64.fromUint(0),
            [
                TransferTransaction.create(
                    Deadline.create(),
                    address,
                    [],
                    PlainMessage.create(
                        'asset(1):otherchain,26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
                    ),
                    network).toAggregate(owner),
                TransferTransaction.create(
                    Deadline.create(),
                    address,
                    [],
                    PlainMessage.create(
                        'metadata(1):key;value|mynumber;3443443.3443434',
                    ),
                    network).toAggregate(owner),
            ],
            [],
            undefined,
            owner,
        );

        accountHttpMock.setup((x) => x.getAccountInfo(address)).returns(() => of(account));
        blockchainHttpMock.setup((x) => x.getBlockTransactions(10)).returns(
            () => of([aggregateTransaction]));
        const assetService = new AssetRepository(accountHttpMock.object, blockchainHttpMock.object, network);

        return assetService.byAddress(address)
            .toPromise()
            .then((x) => {
                expect(x.owner).to.be.equal(owner);
                expect(x.publicKey).to.be.equal('1485030412335ACAE6A59E8F5826AA7B7EAA831EAC73FE60E6A00E893A306F71');
                expect(x.address.plain()).to.be.equal('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA');
                expect(x.source).to.be.equal('otherchain');
                expect(x.identifier)
                    .to.be.equal('26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6');
                expect(x.metadata).to.be.deep.equal({ key: 'value', mynumber: 3443443.3443434});      
            });
    });

    it('should split long metadata into mutliple transactions', () => {

        const longAsset = Asset.create(
            owner,
            'otherchain',
            '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
            {
                key1: 'vvluuveeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveeeuuvuellulavueuaelauevvelelavalelelvvelauluuleuaueeevlvveevevllvuvleluaaavvvaevaulvvuaaelvulvluvleavaleuvvvuleuvuaeueevaveuaaeeeeevalvvlaealuvuveluuavleaalelaeuevvvvaauuavlleeuualelullvalulleavuvvuevlvaeuvluuelaleleluvvaeevlvevuveeuaevlvaavvulvaeavaaueavelelevavueaalvavluelaaveaeulueevuaeavaulllvlavveuevaelleveuvluuvluevalvaavvleelllauuuvleeeleuauaaeleulvvaveaeuaavvalevvueeuulvelevulvuaelueuelaeuvluueaeulvuvelvulveaevvvelualuulvalalaveveuuvuuvllaluaeluualvauevvuluueealauaeellaeuaaeevleululallaeaulluvaavvlvluuuvuaaelveevuveaavuuelaealuuuaevluveleuuveaelvvuluvuuueveellaeluaaelvvavvueauaueuaeuvevalleeaueuvleulaeaeueullaueeuueeleuvvuvavvauvaevvvealvaaveueluaaeuveeeluluvalvveeealevaauelevavvuavleuvaleuvvlleevvulvlavueaelevaelaavvuueevueeulavavvlvluualvallveavelluluvueelvvvaualevuueaeaeuaaeuuvaeevulaveuvuvavauueeeuveaeeueeaaaveuaelavaeauevavvavaaueaveuvulveaueveaauuaualevleauvulevlvuvuvlvalealueuvue',
                key2: 'vvluuveeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveeeuuvuellulavueuaelauevvelelavalelelvvelauluuleuaueeevlvveevevllvuvleluaaavvvaevaulvvuaaelvulvluvleavaleuvvvuleuvuaeueevaveuaaeeeeevalvvlaealuvuveluuavleaalelaeuevvvvaauuavlleeuualelullvalulleavuvvuevlvaeuvluuelaleleluvvaeevlvevuveeuaevlvaavvulvaeavaaueavelelevavueaalvavluelaaveaeulueevuaeavaulllvlavveuevaelleveuvluuvluevalvaavvleelllauuuvleeeleuauaaeleulvvaveaeuaavvalevvueeuulvelevulvuaelueuelaeuvluueaeulvuvelvulveaevvvelualuulvalalaveveuuvuuvllaluaeluualvauevvuluueealauaeellaeuaaeevleululallaeaulluvaavvlvluuuvuaaelveevuveaavuuelaealuuuaevluveleuuveaelvvuluvuuueveellaeluaaelvvavvueauaueuaeuvevalleeaueuvleulaeaeueullaueeuueeleuvvuvavvauvaevvvealvaaveueluaaeuveeeluluvalvveeealevaauelevavvuavleuvaleuvvlleevvulvlavueaelevaelaavvuueevueeulavavvlvluualvallveavelluluvueelvvvaualevuueaeaeuaaeuuvaeevulaveuvuvavauueeeuveaeeueeaaaveuaelavaeauevavvavaaueaveuvulveaueveaauuaualevleauvulevlvuvuvlvalealueuvue',
                key3: 'uuvuellulavueuaelauevvelelavalelelvvelauluuleuaueeevlvveevevllvuvleluaaavvvaevaulvvu',
                key4: 'veeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveee',
                key5: 'veeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveee',
                key6: 'veeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveee',
                key7: 'vvluuveeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveeeuuvuellulavueuaelauevvelelavalelelvvelauluuleuaueeevlvveevevllvuvleluaaavvvaevaulvvuaaelvulvluvleavaleuvvvuleuvuaeueevaveuaaeeeeevalvvlaealuvuveluuavleaalelaeuevvvvaauuavlleeuualelullvalulleavuvvuevlvaeuvluuelaleleluvvaeevlvevuveeuaevlvaavvulvaeavaaueavelelevavueaalvavluelaaveaeulueevuaeavaulllvlavveuevaelleveuvluuvluevalvaavvleelllauuuvleeeleuauaaeleulvvaveaeuaavvalevvueeuulvelevulvuaelueuelaeuvluueaeulvuvelvulveaevvvelualuulvalalaveveuuvuuvllaluaeluualvauevvuluueealauaeellaeuaaeevleululallaeaulluvaavvlvluuuvuaaelveevuveaavuuelaealuuuaevluveleuuveaelvvuluvuuueveellaeluaaelvvavvueauaueuaeuvevalleeaueuvleulaeaeueullaueeuueeleuvvuvavvauvaevvvealvaaveueluaaeuveeeluluvalvveeealevaauelevavvuavleuvaleuvvlleevvulvlavueaelevaelaavvuueevueeulavavvlvluualvallveavelluluvueelvvvaualevuueaeaeuaaeuuvaeevulaveuvuvavauueeeuveaeeueeaaaveuaelavaeauevavvavaaueaveu',
                key8: 'veeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveee',
                key9: 'veeavulaeeuvllelveluuvlvllalauealuuluvelelvueuvaeuuauuleleuueaulevvalauelauaaveuveee',
            },
        );
        //put 6 to include asset identifer transaction as well
        expect(AssetRepository.publish(longAsset).innerTransactions.length).to.be.deep.equal(6);



    });
});
