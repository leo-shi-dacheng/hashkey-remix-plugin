import React from 'react';
import { Container, Form, InputGroup, Tooltip, Button, OverlayTrigger, Nav } from 'react-bootstrap';
import { 
  createPublicClient, 
  createWalletClient, 
  http,
  custom, 
  PublicClient, 
  WalletClient,
  formatEther,
} from 'viem';
import { hashkey, hashkeyTestnet } from 'viem/chains';

import Compiler from './components/Compiler';
import SmartContracts from './components/SmartContracts';
import Tutorial from './components/Tutorial';
import { InterfaceContract } from './components/Types';

// Use viem's built-in HashKey networks
const NETWORKS = {
  HashKey: hashkey,
  HashKeyTestnet: hashkeyTestnet
};

const App: React.FunctionComponent = () => {
  const [account, setAccount] = React.useState<string>('');
  const [balance, setBalance] = React.useState<string>('');
  const [network, setNetwork] = React.useState<string>('HashKey');
  const [disabledNetSelect, setDisabledNetSelect] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [publicClient, setPublicClient] = React.useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = React.useState<WalletClient | null>(null);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [atAddress, setAtAddress] = React.useState<string>('');
  const [contracts, setContracts] = React.useState<InterfaceContract[]>([]);
  const [selected, setSelected] = React.useState<InterfaceContract | null>(null);
  const [view, setView] = React.useState<'dapp' | 'tutorial'>('dapp');

  // Initialize client on component mount
  React.useEffect(() => {
    const client = createPublicClient({
      chain: NETWORKS[network as keyof typeof NETWORKS],
      transport: http()
    });
    setPublicClient(client);
  }, [network]);

  React.useEffect(() => {
    if (account) {
      updateBalance(account);
    }
  }, [account, network, publicClient]);

  async function connect() {
    if (!isConnected) {
      setBusy(true);
      
      try {
        // Check if MetaMask is available
        if (typeof window.ethereum !== 'undefined') {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Set up the wallet client
          const wallet = createWalletClient({
            account: accounts[0] as `0x${string}`,
            chain: NETWORKS[network as keyof typeof NETWORKS],
            transport: custom(window.ethereum)
          });
          
          setWalletClient(wallet);
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Track connection event
          if (window.gtag) {
            window.gtag('event', 'login', {
              method: 'MetaMask',
            });
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            setAccount(newAccounts[0] || '');
            if (!newAccounts.length) {
              setIsConnected(false);
            }
          });
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId: string) => {
            // Reload the page to avoid any issues
            window.location.reload();
          });
        } else {
          console.error('Please install MetaMask!');
          alert('Please install MetaMask to use this application');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
      
      setBusy(false);
    }
  }

  async function updateBalance(address: string) {
    // Add a null check for publicClient
    if (address !== '' && publicClient) {
      try {
		  // @ts-ignore
        const balanc = await publicClient.getBalance({ address: address as `0x${string}` });
        setBalance(formatEther(balanc));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('Error');
      }
    } else {
      // Optionally handle the case where publicClient is null or address is empty
      setBalance(''); 
    }
  }

  async function changeNetwork(e: React.ChangeEvent<HTMLInputElement>) {
    if (!disabledNetSelect) {
      setBusy(true);
      setContracts([]);
      
      const newNetwork = e.target.value;
      const targetChain = NETWORKS[newNetwork as keyof typeof NETWORKS];
      
      try {
        // Request network change in MetaMask
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChain.id.toString(16)}` }],
        }).catch(async (switchError: any) => {
          // If the chain isn't added to MetaMask, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${targetChain.id.toString(16)}`,
                  chainName: targetChain.name,
                  nativeCurrency: targetChain.nativeCurrency,
                  rpcUrls: [targetChain.rpcUrls.default.http[0]],
                },
              ],
            });
          }
        });
        
        // Update client with new network
        const newClient = createPublicClient({
          chain: targetChain,
          transport: http()
        });
        
        setPublicClient(newClient);
        setNetwork(newNetwork);
        
      } catch (error) {
        console.error('Failed to switch network:', error);
      }
      
      setBusy(false);
    }
  }

  function addNewContract(contract: InterfaceContract) {
    setContracts(contracts.concat([contract]));
  }

  function Networks() {
    const list = NETWORKS;
    const items = Object.keys(list).map((key) => (
      <option key={key} value={key}>
        {key}
      </option>
    ));
    return (
      <Form.Group>
        <Form.Text className="text-muted">
          <small>NETWORK</small>
        </Form.Text>
        <Form.Control
          as="select"
          value={network}
          onChange={changeNetwork}
          disabled={!isConnected || disabledNetSelect}
        >
          {items}
        </Form.Control>
      </Form.Group>
    );
  }

  return (
    <div className="App">
      <Container>
        <Nav variant="tabs" defaultActiveKey="dapp" onSelect={(k) => setView(k as any)}>
          <Nav.Item>
            <Nav.Link eventKey="dapp">DApp</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tutorial">Tutorial</Nav.Link>
          </Nav.Item>
        </Nav>
        <div style={{ paddingTop: '1rem' }}>
          {view === 'dapp' ? (
            <>
              <Form>
                <Form.Group>
                  <Form.Text className="text-muted">
                    <small>ACCOUNT</small>
                  </Form.Text>
                  <InputGroup>
                    <Form.Control type="text" placeholder="Account" value={account} size="sm" readOnly />
                    <InputGroup.Append hidden={account !== ''}>
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip id="overlay-connect" hidden={account !== ''}>
                            Connect to Wallet
                          </Tooltip>
                        }
                      >
                        <Button variant="warning" block size="sm" disabled={busy} onClick={connect}>
                          <small>Connect</small>
                        </Button>
                      </OverlayTrigger>
                    </InputGroup.Append>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <Form.Text className="text-muted">
                    <small>BALANCE (HSK)</small>
                  </Form.Text>
                  <InputGroup>
                    <Form.Control type="text" placeholder="Account" value={balance} size="sm" readOnly />
                  </InputGroup>
                </Form.Group>
                <Networks />
              </Form>
.              <hr />
              <Compiler
                publicClient={publicClient}
                walletClient={walletClient}
                network={network}
                gtag={(name: string) => {
                  if (window.gtag) {
                    window.gtag('event', name, { network });
                  }
                }}
                busy={busy}
                setBusy={setBusy}
                addNewContract={addNewContract}
                setSelected={setSelected}
                updateBalance={updateBalance}
              />
              <p className="text-center mt-3">
                <small>OR</small>
              </p>
              <InputGroup className="mb-3">
                <Form.Control
                  value={atAddress}
                  placeholder="contract address"
                  onChange={(e) => {
                    setAtAddress(e.target.value);
                  }}
                  size="sm"
                  disabled={busy || account === '' || !selected}
                />
                <InputGroup.Append>
                  <OverlayTrigger
                    placement="left"
                    overlay={<Tooltip id="overlay-ataddresss">Use deployed Contract address</Tooltip>}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={busy || account === '' || !selected}
                      onClick={() => {
                        setBusy(true);
                        if (selected) {
                          addNewContract({ ...selected, address: atAddress });
                        }
                        setBusy(false);
                      }}
                    >
                      <small>At Address</small>
                    </Button>
                  </OverlayTrigger>
                </InputGroup.Append>
              </InputGroup>
              <hr />
              <SmartContracts
                publicClient={publicClient}
                walletClient={walletClient}
                busy={busy}
                setBusy={setBusy}
                network={network}
                contracts={contracts}
                updateBalance={updateBalance}
              />
            </>
          ) : (
            <Tutorial />
          )}
        </div>
      </Container>
    </div>
  );
};

// Add TypeScript declaration for window.ethereum and window.gtag
declare global {
  interface Window {
    ethereum?: any;
    gtag?: (...args: any[]) => void;
  }
}

export default App;
