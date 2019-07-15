import { expect } from 'chai';
import { Evidence } from '../index';

describe('Evidence', () => {
    it('should contain the block and the transaction hash', () => {
        const evidence = new Evidence(500, '62D7F806C7E7327DB55F4FBB2348DD7785452FD55EEC60BB5D9672AF81141960');
        expect(evidence.block).to.be.equal(500);
        expect(evidence.transaction)
            .to.be.equal('62D7F806C7E7327DB55F4FBB2348DD7785452FD55EEC60BB5D9672AF81141960');
    });
});
