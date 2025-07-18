Already implemted functions in the MameCoin42 contract by openzeppelin:

- ERC20 functions:

    ```name()```: should return the name of the token: "MameCoin42"

    ```symbol()```: should return the symbol of the token: "MAM"

    ```decimals()```: should return the number of decimals: 8

    ```totalSupply()```: should return the total supply of the token

    ```balanceOf(address account)```: should return the balance of the account

    ```transfer(address recipient, uint256 amount)```: should transfer tokens from sender to recipient and emit a Transfer event

    ```allowance(address owner, address spender)```: should return the allowance of spender for owner

    ```increaseAllowance(address spender, uint256 addedValue)```: should emit the Approval event: Approval(owner, spender, value)

    ```decreaseAllowance(address spender, uint256 subtractedValue)```: should emit the Approval event: Approval(owner, spender, value)

    ```approve(address spender, uint256amount)```: should emit the Approval event: Approval(owner, spender, value)

    ```transferFrom(address sender, address recipient, uint256 amount)```: should emit the Transfer event: Transfer(sender, recipient, value)

- ERC20 restricted functions:

    ```mint(address to, uint256 amount)```: should emit the Transfer event: Transfer(0x0, to, value)

    ```burn(address from, uint256 amount)```: should emit the Transfer event: Transfer(from, 0x0, value)

    ```pause()```: should emit the Paused event: Paused(account)

    ```unpause()```: should emit the Unpaused event: Unpaused(account)

    ```transferOwnership(address newOwner)```: should emit the OwnershipTransferred event: OwnershipTransferred(previousOwner, newOwner)

    ```renounceOwnership()```: should emit the OwnershipTransferred event: OwnershipTransferred(owner, 0x0)

- Multisig relativ functions:

    ```enableMultisig(address[] signers, uint256 requiredCount)```: should emit the event NewMultisigEnabled(address signer, address contractAddress)

    ```addMultisigSigner(address newSigner)```

    ```removeMultisigSigner(address oldSigner)```

    ```submitTransactionToMultisig(address to, uint256 value)```: should emit the event NewTransactionSubmittedToMultisig(address indexed to, uint256 indexed value, address indexed sender)

    ```multisigSignTransaction(uint transactionId, address account)```: should emit TransactionExecuted(uint transactionId, address to, uint256 value) if the right number of signatures is reached and transaction is executed



