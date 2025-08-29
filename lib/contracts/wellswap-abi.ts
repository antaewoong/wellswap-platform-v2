export const WELLSWAP_CONTRACT_ADDRESS = "0xa84125fe1503485949d3e4fedcc454429289c8ea"

export const WELLSWAP_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_assetId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_agreedPrice",
        "type": "uint256"
      }
    ],
    "name": "createMultisigTrade",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tradeId",
        "type": "uint256"
      }
    ],
    "name": "signTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tradeId",
        "type": "uint256"
      }
    ],
    "name": "executeTrade",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_tradeId",
        "type": "uint256"
      }
    ],
    "name": "getMultisigStatus",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "currentSignatures",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "requiredSignatures",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isExecuted",
            "type": "bool"
          }
        ],
        "internalType": "struct WellSwapMultisig.MultisigStatus",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const
