# nem2-nonfungible-asset

[![npm version](https://badge.fury.io/js/nem2-nonfungible-asset.svg)](https://badge.fury.io/js/nem2-nonfungible-asset)
[![Build Status](https://api.travis-ci.org/nemfoundation/nem2-nonfungible-asset.svg?branch=master)](https://travis-ci.org/nemfoundation/nem2-nonfungible-asset)
[![Coverage Status](https://coveralls.io/repos/github/nemfoundation/nem2-nonfungible-asset/badge.svg?branch=master)](https://coveralls.io/github/nemfoundation/nem2-nonfungible-asset?branch=master)
![license](https://img.shields.io/github/license/mashape/apistatus.svg)
[![Gitter chat](https://badges.gitter.im/nem2-libs/Lobby.svg)](https://gitter.im/nem2-libs/nem2-nonfungible-asset)


:warning: experimental nem2 library for nonfungible-asset in nem2 blockchain. It will be submitted into [nemtech/NIP][nip] when it becomes more stable.

## Abstract

The goal of the library is manage nonfungible assets that on NEM2, aka Catapult, in a deterministic way.

## Usage

### Creating an asset

```typescript
import { Asset } from 'nem2-nonfungible-asset';
import { NetworkType, PublicAccount } from 'nem2-sdk';

const network = NetworkType.MIJIN_TEST;
const owner = PublicAccount.createFromPublicKey(
    '6C516BCD2F92F9C6F60477E7751DB030157CA33FEF1DAB0585C1B002D14896AE',
    network,
);

const asset = Asset.create(
    owner,
    'otherchain',
    '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6',
    {
        'metadata_key': 'metadata_value',
    },
);

console.log(asset.getMetadata('metadata_key'));
```

### Publishing an asset

```typescript
import { Asset, AssetRepository } from 'nem2-nonfungible-asset';
import { Account, NetworkType, PublicAccount, TransactionHttp } from 'nem2-sdk';

// Repositories
const transactionHttp = new TransactionHttp('http://localhost:3000');

// Replace with a private key
const privateKey = process.env.PRIVATE_KEY as string;
const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);

const asset = Asset.create(/* ... */); // Previous point
const publishableAsset = AssetRepository.publish(asset);

// Publishing
transactionHttp
    .announce(account.sign(publishableAsset))
    .subscribe(result => console.log('asset published'));
```

### Receiving an asset

```typescript
import { Asset, AssetRepository } from 'nem2-nonfungible-asset';
import { Account, NetworkType, PublicAccount, TransactionHttp, AccountHttp, BlockchainHttp } from 'nem2-sdk';

// constants
const node = 'http://localhost:3000';
const network = NetworkType.MIJIN_TEST;

// Repositories
const assetRepository = new AssetRepository(new AccountHttp(node), new BlockchainHttp(node), network);

// by source and identifier
assetRepository.byAssetIdentifier('otherchain', '26198278f6e862fd82d26c7388a9ed19ed16282c2a4d562463b8b4336929c5d6')
    .subscribe(asset => {
        console.log('>>> Asset information');
        console.log('Address\t', asset.address);
    }, err => console.error('it is not a valid asset'));

assetRepository.byAddress('SAG3VKH4XRCVYTMDMHUN62AH353TJC74BFDKKNOA')
    .subscribe(asset => { /** ... */ }, err => console.error('it is not a valid asset'));

assetRepository.byPublicKey('1485030412335ACAE6A59E8F5826AA7B7EAA831EAC73FE60E6A00E893A306F71')
    .subscribe(asset => { /** ... */ }, err => console.error('it is not a valid asset'));
```

## License

Copyright (c) 2018 NEM Foundation Licensed under the MIT License

## Usage

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[nip]: https://github.com/nemtech/NIP
[ipfs]: https://ipfs.io/