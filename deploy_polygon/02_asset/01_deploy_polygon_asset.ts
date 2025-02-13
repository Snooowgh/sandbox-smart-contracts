import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {skipUnlessTestOrL2} from '../../utils/network';

const func: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
): Promise<void> {
  const {deployments, getNamedAccounts} = hre;
  const {
    deployer,
    upgradeAdmin,
    assetAdmin,
    assetBouncerAdmin,
  } = await getNamedAccounts();
  const {deploy} = deployments;

  const TRUSTED_FORWARDER = await deployments.get('TRUSTED_FORWARDER');
  const CHILD_CHAIN_MANAGER = await deployments.get('CHILD_CHAIN_MANAGER');

  await deploy('PolygonAsset', {
    from: deployer,
    contract: 'PolygonAssetV2',
    proxy: {
      owner: upgradeAdmin,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        methodName: 'initialize',
        args: [
          TRUSTED_FORWARDER.address,
          assetAdmin,
          assetBouncerAdmin,
          CHILD_CHAIN_MANAGER.address,
          1,
        ],
      },
      upgradeIndex: 0,
    },
    log: true,
  });
};

export default func;
func.tags = ['PolygonAsset', 'PolygonAsset_deploy'];
func.dependencies = ['TRUSTED_FORWARDER', 'CHILD_CHAIN_MANAGER'];
func.skip = skipUnlessTestOrL2; // TODO: change to skip unless L2
