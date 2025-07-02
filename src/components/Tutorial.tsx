import React from 'react';

export default function Tutorial() {
  return (
    <div>
      <h2>Welcome to the HashKey Remix Plugin!</h2>
      <p>
        This tutorial will guide you through using this plugin to compile, deploy, and interact with a standard ERC20 token contract on the <strong>HashKey Testnet</strong>.
      </p>

      <hr />

      <h3>Step 1: Connect to the HashKey Testnet</h3>
      <p>
        Before we start, let&apos;s get your environment ready.
      </p>
      <ol>
        <li>Make sure you are in the <strong>DApp</strong> tab of this plugin.</li>
        <li>Click the <strong>Connect</strong> button at the top to link your MetaMask wallet.</li>
        <li>
          From the <strong>NETWORK</strong> dropdown menu, select <strong>HashKeyTestnet</strong>. Your wallet may ask you to approve switching networks.
        </li>
        <li>Once connected, you should see your account address and balance displayed at the top.</li>
      </ol>

      <hr />

      <h3>Step 2: Get the ERC20 Contract Code</h3>
      <p>
        Next, you&apos;ll need the Solidity code for the token. We&apos;ll use a standard ERC20 contract from OpenZeppelin.
      </p>
      <p>
        In the Remix editor, create a new file named <code>MyToken.sol</code> and paste the following code into it.
      </p>
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
      <p>
        <small>This simple contract creates a token called &quot;MyToken&quot; (MTK) and mints an initial supply of 1,000 tokens to your address upon deployment.</small>
      </p>

      <hr />

      <h3>Step 3: Compile with the Plugin</h3>
      <p>
        Now, let&apos;s compile the contract using our plugin&apos;s interface.
      </p>
      <ol>
        <li>In the <strong>Compiler</strong> section of the plugin, click the large <strong>Compile</strong> button.</li>
        <li>
          The plugin will compile the code from your active editor tab.
        </li>
        <li>
          After a moment, you should see <code>MyToken</code> appear in the contract selection dropdown below the compile button, indicating success.
        </li>
      </ol>

      <hr />

      <h3>Step 4: Deploy to HashKey Testnet</h3>
      <p>
        With the contract compiled, it&apos;s time to deploy it.
      </p>
      <ol>
        <li>Ensure <code>MyToken</code> is selected in the contract dropdown.</li>
        <li>Click the <strong>Deploy</strong> button to the right of the dropdown.</li>
        <li>A MetaMask pop-up will appear asking you to confirm the deployment transaction. Click <strong>Confirm</strong>.</li>
        <li>
          Once the transaction is confirmed on the network, your contract will appear in the <strong>Deployed Contracts</strong> list at the bottom of the plugin.
        </li>
      </ol>

      <hr />

      <h3>Step 5: Interact with Your Token</h3>
      <p>
        Your token is now live on the HashKey Testnet! Let&apos;s interact with it directly from the plugin.
      </p>
      <ol>
        <li>
          In the <strong>Deployed Contracts</strong> list, click on your new <code>MyToken</code> contract to expand its functions.
        </li>
        <li>
          <strong>Check your balance:</strong> Copy your account address from the top of the plugin. Paste it into the <code>balanceOf</code> field and click the button. Your balance of 1000 (with 18 decimals) will be displayed.
        </li>
        <li>
          <strong>Transfer tokens:</strong> To send tokens, fill in the <code>transfer</code> fields with a recipient&apos;s address and an amount.
          <br />
          <small><em>Note: Amounts should be in the smallest unit (wei). For 1 token, you would enter <code>1000000000000000000</code>.</em></small>
        </li>
        <li>You can also call other functions like <code>name</code>, <code>symbol</code>, and <code>totalSupply</code> to read the token&apos;s data.</li>
      </ol>
    </div>
  );
}
