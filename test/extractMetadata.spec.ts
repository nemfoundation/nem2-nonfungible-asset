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
import { extractMetadata } from '../src/AssetRepository';

describe('extractMetadata', () => {
    it('should extract a metadata pair', () => {
        const metadata = extractMetadata([
            'metadata(1):key;value',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
        });
    });

    it('should extract the multiple metadata pairs', () => {
        const metadata = extractMetadata([
            'metadata(1):key;value|name;nem2-asset-library',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            name: 'nem2-asset-library',
        });
    });

    it('should extract number', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|name;123',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            name: 123,
        });
    });

    it('should extract float', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|name;123.123',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            name: 123.123,
        });
    });
    
    it('should extract boolean', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|name;true',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            name: true,
        });
    });

    it('should take boolean as key and extract boolean', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|true;true',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            true: true,
        });
    });
    
    it('should take boolean as key and extract number', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|true;123',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            true: 123,
        });
    });
    
    it('should take boolean as key and extract float', () =>{
        const metadata = extractMetadata([
            'metadata(1):key;value|true;123.123',
        ]);
        expect(metadata).to.be.deep.equal({
            key: 'value',
            true: 123.123,
        });
    });

});
