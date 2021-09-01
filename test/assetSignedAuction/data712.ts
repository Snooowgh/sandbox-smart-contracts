type Message = {
  from: string;
};

type Contract = {
  address: string;
};

type Data712 = {
  types: {
    EIP712Domain: [
      {
        name: 'name';
        type: 'string';
      },
      {
        name: 'version';
        type: 'string';
      },
      {
        name: 'verifyingContract';
        type: 'address';
      }
    ];
    Auction: [
      {
        name: 'from';
        type: 'address';
      }
    ];
  };
  primaryType: 'Auction';
  domain: {
    name: 'The Sandbox 3D';
    version: '1';
    verifyingContract: string;
  };
  message: Message;
};

export const data712 = function (
  verifyingContract: Contract,
  message: Message
): Data712 {
  return {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      Auction: [
        {
          name: 'from',
          type: 'address',
        },
      ],
    },
    primaryType: 'Auction',
    domain: {
      name: 'The Sandbox 3D',
      version: '1',
      verifyingContract: verifyingContract.address,
    },
    message: message,
  };
};
