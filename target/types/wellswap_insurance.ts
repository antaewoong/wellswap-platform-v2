// Anchor IDL types for WellSwap Insurance Smart Contract
export type WellswapInsurance = {
  version: "0.1.0";
  name: "wellswap_insurance";
  instructions: [
    {
      name: "initialize";
      accounts: [
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "registerAsset";
      accounts: [
        { name: "asset"; isMut: true; isSigner: false },
        { name: "owner"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "id"; type: "u64" },
        { name: "value"; type: "u64" }
      ];
    }
  ];
  accounts: [
    {
      name: "InsuranceAsset";
      type: {
        kind: "struct";
        fields: [
          { name: "id"; type: "u64" },
          { name: "owner"; type: "publicKey" },
          { name: "value"; type: "u64" },
          { name: "isActive"; type: "bool" }
        ];
      };
    }
  ];
};

export const IDL: WellswapInsurance = {
  version: "0.1.0",
  name: "wellswap_insurance",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "registerAsset",
      accounts: [
        { name: "asset", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "id", type: "u64" },
        { name: "value", type: "u64" }
      ]
    }
  ],
  accounts: [
    {
      name: "InsuranceAsset",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "u64" },
          { name: "owner", type: "publicKey" },
          { name: "value", type: "u64" },
          { name: "isActive", type: "bool" }
        ]
      }
    }
  ]
};