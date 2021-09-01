import {ethers} from 'hardhat';
import {setupTestAuction} from './fixtures';
import {setupAsset} from '../asset/fixtures';
import {constants} from 'ethers';
import {waitFor, toWei} from '../utils';
import {expect} from '../chai-setup';
import BN from 'bn.js';
import crypto from 'crypto';
import {data712} from './data712';
import {splitSignature} from 'ethers/lib/utils';

const zeroAddress = constants.AddressZero;

const domainType = [
  {name: 'name', type: 'string'},
  {name: 'version', type: 'string'},
  {name: 'verifyingContract', type: 'address'},
];

const auctionType = [
  {name: 'from', type: 'address'},
  {name: 'token', type: 'address'},
  {name: 'offerId', type: 'uint256'},
  {name: 'startingPrice', type: 'uint256'},
  {name: 'endingPrice', type: 'uint256'},
  {name: 'startedAt', type: 'uint256'},
  {name: 'duration', type: 'uint256'},
  {name: 'packs', type: 'uint256'},
  {name: 'ids', type: 'bytes'},
  {name: 'amounts', type: 'bytes'},
];

// eslint-disable-next-line mocha/no-skipped-tests
describe('Auction', function () {
  let offerId: any;
  const startingPrice = toWei('1');
  const endingPrice = toWei('5');
  let startedAt: any;
  const duration = 1000;
  const packs = 1;
  const buyAmount = 1;
  const amounts = [1];
  let tokenId: any;
  let assetSignedAuctionContract: any;
  let assetContract: any;
  let others: any;
  let assetSignedAuctionContractAsUser: any;

  function getDomainData() {
    return {
      name: 'The Sandbox 3D',
      version: '1',
      verifyingContract: assetSignedAuctionContract.address,
    };
  }

  function getAuctionData() {
    return {
      from: others[1],
      token: assetContract.address,
      offerId,
      startingPrice,
      endingPrice,
      startedAt,
      duration,
      packs,
      ids: [tokenId],
      amounts,
    };
  }

  async function getSignature() {
    // const hashedData: any = {
    //     types: {
    //         EIP712Domain: domainType,
    //         Auction: auctionType
    //     },
    //     domain: getDomainData(),
    //     primaryType: 'Auction',
    //     message: getAuctionData()
    // }
    // const wallet = await ethers.getSigner(others[0]);

    const hashedData = await ethers.utils.solidityKeccak256(
      [
        'address',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256[]',
        'uint256[]',
      ],
      [
        others[0],
        assetContract.address,
        offerId,
        startingPrice,
        endingPrice,
        startedAt,
        duration,
        packs,
        [tokenId],
        amounts,
      ]
    );
    const wallet = await ethers.getSigner(others[0]);
    return await wallet.signMessage(ethers.utils.arrayify(hashedData));
  }

  before(async function () {
    const options = {
      fee10000th: 200,
    };
    const {
      assetSignedAuctionContract1,
      assetContract1,
      others1,
    } = await setupTestAuction(options);
    assetSignedAuctionContract = assetSignedAuctionContract1;
    assetContract = assetContract1;
    others = others1;
    assetSignedAuctionContractAsUser = await assetSignedAuctionContract.connect(
      ethers.provider.getSigner(others[0])
    );

    const {mintAsset} = await setupAsset();
    tokenId = await mintAsset(others[0], 20);
  });

  beforeEach(async function () {
    offerId = new BN(crypto.randomBytes(32), 16).toString(10);
    startedAt = Math.floor(Date.now() / 1000);
  });

  it('Claiming sell offer is working correctly.', async function () {
    const message = {
      from: others[0],
    };

    const data = data712(assetSignedAuctionContract, message);
    const flatSig = await ethers.provider.send('eth_signTypedData_v4', [
      others[0],
      data,
    ]);
    const sig = splitSignature(flatSig);
    console.log('from = ', others[0]);
    console.log('data712 = ', data);
    console.log('signature = ', flatSig);

    await waitFor(
      assetSignedAuctionContractAsUser.test(
        others[0],
        flatSig,
        sig.v,
        sig.r,
        sig.s
      )
    );
  });
});
