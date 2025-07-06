# The ERC20 (EVM)

The ERC20 is a standard for creating fungible tokens on the Ethereum blockchain. It defines a set of rules and functions that a token contract must implement to be considered an ERC20 token:

## Here is an overview of the ERC20 standard:


### The 3 optional functions:

- name: Returns the name of the token.
- symbol: Returns the symbol of the token, which is a short identifier (like a stock ticker).
- decimals: Returns the number of decimal places the token can be divided into.

### The 6 mandatory functions:

- totalSupply: Manages the maximum number of tokens. The Smart Contract must be able to stop creating tokens once the limit is reached.

- balanceOf: Manages balances. The Smart Contract must be able to tell how many tokens an address owns.

- transfer: The Smart Contract uses this method to send tokens from the provider to a user.

- transferFrom: The Smart Contract handles transferring tokens between users.

- approve: The Smart Contract determines if it can give tokens to a user by checking that the total tokens in circulation haven’t reached the limit.

- allowance: The Smart Contract verifies that the user trying to send tokens has a minimum amount to complete the transfer.

