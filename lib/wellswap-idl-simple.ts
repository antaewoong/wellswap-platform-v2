// 단순화된 IDL - 테스트용
export const IDL = {
  version: "0.1.0",
  name: "wellswap_insurance",
  instructions: [
    {
      name: "registerInsuranceAsset",
      accounts: [
        { name: "insuranceAsset", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "userTokenAccount", isMut: true, isSigner: false },
        { name: "platformTokenAccount", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "assetData", type: { defined: "InsuranceAssetData" } },
        { name: "registrationFee", type: "u64" }
      ]
    }
  ],
  types: [
    {
      name: "InsuranceAssetData",
      type: {
        kind: "struct",
        fields: [
          { name: "insuranceCompany", type: "string" },
          { name: "productCategory", type: "string" },
          { name: "productName", type: "string" },
          { name: "contractDate", type: "i64" },
          { name: "contractPeriod", type: "string" },
          { name: "paidPeriod", type: "string" },
          { name: "annualPremium", type: "u64" },
          { name: "totalPaid", type: "u64" }
        ]
      }
    }
  ]
};