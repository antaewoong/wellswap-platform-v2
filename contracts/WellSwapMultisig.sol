// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WellSwapMultisig is ReentrancyGuard, Ownable {
    IERC20 public immutable usdc;
    
    // 동적 수수료 설정 (관리자가 변경 가능)
    uint256 public registrationFee = 1e4; // 0.01 USDC (6 decimals) - 초기값
    uint256 public platformFeePercent = 250; // 2.5% (basis points) - 초기값
    uint256 public constant EXPIRY_PERIOD = 61 days;
    
    // 자산 상태 열거형
    enum AssetStatus { 
        Listed,      // 1단계: 등록됨
        Priced,      // 2단계: 가격 책정됨  
        Escrowed,    // 3단계: 구매자 입금됨
        Completed,   // 4단계: 정산 완료
        Expired      // 61일 만료
    }
    
    // 보험 자산 구조체
    struct InsuranceAsset {
        uint256 assetId;
        address seller;
        address buyer;
        string insuranceCompany;
        string productName;
        string productCategory;
        uint256 contractDate;
        uint256 contractPeriod; // years
        uint256 paidPeriod; // years  
        uint256 annualPremium;
        uint256 totalPaid;
        uint256 platformPrice; // AI + 가중치로 책정된 가격
        uint256 registrationFee;
        uint256 listingTimestamp;
        AssetStatus status;
    }
    
    // 멀티시그 거래 구조체
    struct MultisigTrade {
        uint256 assetId;
        address initiator;
        uint256 amount;
        uint8 requiredSignatures;
        uint8 currentSignatures;
        mapping(address => bool) hasApproved;
        address[] approvers;
        bool executed;
        uint256 createdAt;
    }
    
    // 상태 변수
    mapping(uint256 => InsuranceAsset) public insuranceAssets;
    mapping(uint256 => MultisigTrade) public multisigTrades;
    mapping(address => bool) public isAdmin;
    
    uint256 public nextAssetId = 1;
    uint256 public nextTradeId = 1;
    uint256 public platformBalance;
    
    // 이벤트
    event AssetRegistered(uint256 indexed assetId, address indexed seller, uint256 registrationFee);
    event AssetPriced(uint256 indexed assetId, uint256 platformPrice);
    event AssetPurchased(uint256 indexed assetId, address indexed buyer, uint256 amount);
    event TradeCompleted(uint256 indexed assetId, address indexed seller, address indexed buyer, uint256 amount);
    event AssetExpired(uint256 indexed assetId, uint256 registrationFee);
    event MultisigTradeCreated(uint256 indexed tradeId, uint256 indexed assetId, address initiator);
    event MultisigTradeApproved(uint256 indexed tradeId, address approver, uint8 signatures);
    event MultisigTradeExecuted(uint256 indexed tradeId, uint256 amount);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeeUpdated(uint256 oldFeePercent, uint256 newFeePercent);
    
    // 생성자
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        isAdmin[msg.sender] = true;
    }
    
    // 관리자 권한 수정자
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not an admin");
        _;
    }
    
    // 관리자 추가/제거
    function setAdmin(address admin, bool status) external onlyOwner {
        isAdmin[admin] = status;
    }
    
    // 1단계: 판매자 등록 (멀티시그)
    function registerInsuranceAsset(
        string memory insuranceCompany,
        string memory productName, 
        string memory productCategory,
        uint256 contractDate,
        uint256 contractPeriod,
        uint256 paidPeriod,
        uint256 annualPremium,
        uint256 totalPaid
    ) external nonReentrant {
        require(usdc.transferFrom(msg.sender, address(this), registrationFee), "Registration fee transfer failed");
        
        uint256 assetId = nextAssetId++;
        
        insuranceAssets[assetId] = InsuranceAsset({
            assetId: assetId,
            seller: msg.sender,
            buyer: address(0),
            insuranceCompany: insuranceCompany,
            productName: productName,
            productCategory: productCategory,
            contractDate: contractDate,
            contractPeriod: contractPeriod,
            paidPeriod: paidPeriod,
            annualPremium: annualPremium,
            totalPaid: totalPaid,
            platformPrice: 0,
            registrationFee: registrationFee,
            listingTimestamp: block.timestamp,
            status: AssetStatus.Listed
        });
        
        emit AssetRegistered(assetId, msg.sender, registrationFee);
    }
    
    // 2단계: 플랫폼 가격 책정 (멀티시그)
    function setPlatformPrice(uint256 assetId, uint256 price) external onlyAdmin {
        require(insuranceAssets[assetId].status == AssetStatus.Listed, "Asset not available for pricing");
        require(!_isExpired(assetId), "Asset expired");
        
        insuranceAssets[assetId].platformPrice = price;
        insuranceAssets[assetId].status = AssetStatus.Priced;
        
        emit AssetPriced(assetId, price);
    }
    
    // 3단계: 구매자 매수 (멀티시그)
    function purchaseAsset(uint256 assetId) external nonReentrant {
        InsuranceAsset storage asset = insuranceAssets[assetId];
        require(asset.status == AssetStatus.Priced, "Asset not available for purchase");
        require(asset.platformPrice > 0, "Price not set");
        require(!_isExpired(assetId), "Asset expired");
        require(msg.sender != asset.seller, "Cannot buy own asset");
        
        uint256 totalAmount = asset.platformPrice;
        require(usdc.transferFrom(msg.sender, address(this), totalAmount), "Payment transfer failed");
        
        asset.buyer = msg.sender;
        asset.status = AssetStatus.Escrowed;
        
        emit AssetPurchased(assetId, msg.sender, totalAmount);
    }
    
    // 4단계: 최종 정산 (멀티시그)
    function completeTransaction(uint256 assetId) external onlyAdmin nonReentrant {
        InsuranceAsset storage asset = insuranceAssets[assetId];
        require(asset.status == AssetStatus.Escrowed, "Asset not in escrow");
        
        uint256 totalAmount = asset.platformPrice;
        uint256 platformFee = (totalAmount * platformFeePercent) / 10000;
        uint256 sellerAmount = totalAmount - platformFee;
        
        // 정산 실행
        platformBalance += platformFee + asset.registrationFee;
        require(usdc.transfer(asset.seller, sellerAmount), "Seller payment failed");
        
        asset.status = AssetStatus.Completed;
        
        emit TradeCompleted(assetId, asset.seller, asset.buyer, totalAmount);
    }
    
    // 61일 만료 체크 및 처리
    function expireAsset(uint256 assetId) external {
        require(_isExpired(assetId), "Asset not yet expired");
        InsuranceAsset storage asset = insuranceAssets[assetId];
        require(asset.status == AssetStatus.Listed || asset.status == AssetStatus.Priced, "Asset not eligible for expiry");
        
        asset.status = AssetStatus.Expired;
        platformBalance += asset.registrationFee;
        
        emit AssetExpired(assetId, asset.registrationFee);
    }
    
    // 만료 여부 체크
    function _isExpired(uint256 assetId) internal view returns (bool) {
        return block.timestamp >= insuranceAssets[assetId].listingTimestamp + EXPIRY_PERIOD;
    }
    
    // 플랫폼 수익 인출
    function withdrawPlatformFunds(uint256 amount) external onlyOwner {
        require(amount <= platformBalance, "Insufficient platform balance");
        platformBalance -= amount;
        require(usdc.transfer(msg.sender, amount), "Withdrawal failed");
    }
    
    // 자산 정보 조회
    function getAsset(uint256 assetId) external view returns (InsuranceAsset memory) {
        return insuranceAssets[assetId];
    }
    
    // 만료까지 남은 시간 조회
    function getTimeUntilExpiry(uint256 assetId) external view returns (uint256) {
        uint256 expiryTime = insuranceAssets[assetId].listingTimestamp + EXPIRY_PERIOD;
        if (block.timestamp >= expiryTime) {
            return 0;
        }
        return expiryTime - block.timestamp;
    }
    
    // 관리자 전용: 수수료 설정 함수들
    function setRegistrationFee(uint256 _newFee) external onlyOwner {
        require(_newFee > 0, "Registration fee must be greater than 0");
        require(_newFee <= 1000e6, "Registration fee too high (max 1000 USDC)");
        
        uint256 oldFee = registrationFee;
        registrationFee = _newFee;
        
        emit RegistrationFeeUpdated(oldFee, _newFee);
    }
    
    function setPlatformFeePercent(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Platform fee too high (max 10%)");
        
        uint256 oldFeePercent = platformFeePercent;
        platformFeePercent = _newFeePercent;
        
        emit PlatformFeeUpdated(oldFeePercent, _newFeePercent);
    }
    
    // 응급 상황 대비 함수들
    function emergencyPause() external onlyOwner {
        // 필요시 구현
    }
    
    function getContractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
}