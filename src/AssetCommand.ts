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
import { Asset } from './Asset';
import { Evidence } from './Evidence';

export abstract class AssetCommand {

    constructor(private readonly theEvidence?: Evidence) {}

    /**
     * Applies the specific logic to an asset and returns a new Asset with the logic applied and the event stored
     * @returns Asset Asset with the logic applied and stored the event
     */
    public abstract apply(): Asset;

    /**
     * @returns a boolean to know if an event applied to an asset has been read in the network
     * or still has to be persisted
     */
    public isPersisted(): boolean {
        return this.theEvidence !== undefined;
    }

    /**
     * @returns an string with the event descriptor for later be read properly
     */
    public abstract toDTO(): string;

    /**
     * @returns the evidence in case it is persisted
     */
    public evidence(): Evidence {
        if (this.theEvidence) {
            return this.theEvidence;
        }
        throw new Error('evidence not present');
    }
}
