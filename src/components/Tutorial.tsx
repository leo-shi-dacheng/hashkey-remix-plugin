import React from 'react';

export default function Tutorial() {
  return (
    <div>
      <h2>ERC20 Token Tutorial</h2>
      <p>This tutorial will guide you through creating, deploying, and interacting with a standard ERC20 token contract.</p>

      <hr />

      <h3>Step 1: Get the ERC20 Contract Code</h3>
      <p>Use the following code for a basic ERC20 token. This code is based on the OpenZeppelin ERC20 implementation.</p>
      <pre>
        <code>
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000 * 10 ** decimals());
    }
}`}
        </code>
      </pre>
      <p>Copy this code into a new Solidity file in Remix (e.g., `MyToken.sol`).</p>

      <hr />

      <h3>Step 2: Compile the Contract</h3>
      <p>
        1. Go to the <strong>Compiler</strong> tab in this plugin.
        <br />
        2. Make sure the compiler version is set to a compatible version (e.g., 0.8.20 or higher).
        <br />
        3. Click the <strong>Compile</strong> button.
        <br />
        4. You should see a success message and the contract &quot;MyToken&quot; should appear in the list of compiled contracts.
      </p>

      <hr />

      <h3>Step 3: Deploy the Contract</h3>
      <p>
        1. Navigate to the <strong>Deploy &amp; Run</strong> section of the plugin.
        <br />
        2. Select the &quot;MyToken&quot; contract from the contract dropdown list.
        <br />
        3. Click the <strong>Deploy</strong> button.
        <br />
        4. Approve the transaction in your wallet (e.g., MetaMask).
        <br />
        5. Once deployed, you will see the contract address in the &quot;Deployed Contracts&quot; list.
      </p>

      <hr />

      <h3>Step 4: Interact with Your Token</h3>
      <p>
        Now you can interact with your newly created ERC20 token.
        <br />
        1. In the &quot;Deployed Contracts&quot; section, click on your `MyToken` contract to expand its functions.
        <br />
        2. You can now call the standard ERC20 functions:
        <ul>
          <li><code>name</code>: Returns &quot;MyToken&quot;.</li>
          <li><code>symbol</code>: Returns &quot;MTK&quot;.</li>
          <li><code>totalSupply</code>: Returns the total supply of tokens (1000).</li>
          <li><code>balanceOf</code>: Enter your wallet address to check your balance.</li>
          <li><code>transfer</code>: Enter a recipient address and an amount to send tokens.</li>
        </ul>
      </p>
    </div>
  );
}