export const IDL = {
  "version": "0.1.0",
  "name": "wellswap_new",
  "instructions": [
    {
      "name": "registerInsuranceAsset",
      "accounts": [
        {
          "name": "insuranceAsset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platformTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetData",
          "type": {
            "defined": "InsuranceAssetData"
          }
        },
        {
          "name": "registrationFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "purchaseInsuranceAsset",
      "accounts": [
        {
          "name": "insuranceAsset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "buyerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "purchasePrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createMultisigTrade",
      "accounts": [
        {
          "name": "multisigTrade",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "initiator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetId",
          "type": "u64"
        },
        {
          "name": "tradeAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "approveMultisigTrade",
      "accounts": [
        {
          "name": "multisigTrade",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "approver",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "listInsuranceAssetForSale",
      "accounts": [
        {
          "name": "insuranceAsset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "salePrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelInsuranceAssetSale",
      "accounts": [
        {
          "name": "insuranceAsset",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "InsuranceAsset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "insuranceCompany",
            "type": "string"
          },
          {
            "name": "productCategory",
            "type": "string"
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "contractDate",
            "type": "i64"
          },
          {
            "name": "contractPeriod",
            "type": "u32"
          },
          {
            "name": "paidPeriod",
            "type": "u32"
          },
          {
            "name": "annualPremium",
            "type": "u64"
          },
          {
            "name": "totalPaid",
            "type": "u64"
          },
          {
            "name": "isForSale",
            "type": "bool"
          },
          {
            "name": "salePrice",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "registrationFee",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "MultisigTrade",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "assetId",
            "type": "u64"
          },
          {
            "name": "initiator",
            "type": "publicKey"
          },
          {
            "name": "tradeAmount",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": "TradeStatus"
            }
          },
          {
            "name": "approvers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InsuranceAssetData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "insuranceCompany",
            "type": "string"
          },
          {
            "name": "productCategory",
            "type": "string"
          },
          {
            "name": "productName",
            "type": "string"
          },
          {
            "name": "contractDate",
            "type": "i64"
          },
          {
            "name": "contractPeriod",
            "type": "u32"
          },
          {
            "name": "paidPeriod",
            "type": "u32"
          },
          {
            "name": "annualPremium",
            "type": "u64"
          },
          {
            "name": "totalPaid",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TradeStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Completed"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "InsuranceAssetRegistered",
      "fields": [
        {
          "name": "asset",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "insuranceCompany",
          "type": "string",
          "index": false
        },
        {
          "name": "registrationFee",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "InsuranceAssetPurchased",
      "fields": [
        {
          "name": "asset",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "previousOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOwner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "purchasePrice",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MultisigTradeCreated",
      "fields": [
        {
          "name": "trade",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetId",
          "type": "u64",
          "index": false
        },
        {
          "name": "initiator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tradeAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "MultisigTradeApproved",
      "fields": [
        {
          "name": "trade",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "approver",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "approversCount",
          "type": "u8",
          "index": false
        },
        {
          "name": "status",
          "type": {
            "defined": "TradeStatus"
          },
          "index": false
        }
      ]
    },
    {
      "name": "InsuranceAssetListedForSale",
      "fields": [
        {
          "name": "asset",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "salePrice",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "InsuranceAssetSaleCancelled",
      "fields": [
        {
          "name": "asset",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "AssetNotForSale",
      "msg": "Asset is not for sale"
    },
    {
      "code": 6001,
      "name": "NotOwner",
      "msg": "Not the owner"
    },
    {
      "code": 6002,
      "name": "InsufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6003,
      "name": "InvalidTradeAmount",
      "msg": "Invalid trade amount"
    }
  ]
};
