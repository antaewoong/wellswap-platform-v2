export const WELLSWAP_CONTRACT_ADDRESS = "0x58228104D72Aa48F1761804a090be24c01523972"

export const WELLSWAP_ABI = [
  // Read functions
  "function owner() view returns (address)",
  "function treasuryWallet() view returns (address)",
  "function bnbUsdPrice() view returns (uint256)",
  "function assetCounter() view returns (uint256)",
  "function tradeCounter() view returns (uint256)",
  "function SELLER_FEE_USD() view returns (uint256)",
  "function BUYER_FEE_USD() view returns (uint256)",
  "function getAssetInfo(uint256 assetId) view returns (tuple(uint256 id, address seller, string company, string product, uint256 premiumPaid, uint256 currentValue, uint256 aiValuation, uint256 platformPrice, bool isListed, bool isVerified, bool isPriceSet, uint256 registrationTime, string ipfsHash, uint256 sellerFeePaid, bool sellerFeeReleased))",
  "function getRegistrationFeesBNB() view returns (uint256, uint256)",
  
  // Write functions
  "function updateBNBPrice(uint256 _newPrice) external",
  "function registerInsuranceAsset(string memory _company, string memory _product, uint256 _premiumPaid, uint256 _currentValue, string memory _ipfsHash) external payable",
  "function updateAIEvaluation(uint256 _assetId, uint256 _evaluatedValue, uint256 _confidenceScore, string memory _evaluationData) external",
  "function setPlatformPrice(uint256 _assetId, uint256 _platformPrice) external",
  "function purchaseAsset(uint256 _assetId) external payable",
  "function createMultisigTrade(uint256 _assetId, uint256 _agreedPrice) external payable",
  "function signTrade(uint256 _tradeId) external",
  "function executeTrade(uint256 _tradeId) external"
] as const
