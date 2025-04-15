import React from 'react';
import { Alert, Button, Card, Form, InputGroup } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import { AbiInput, AbiItem } from 'web3-utils';
import type { Api } from '@remixproject/plugin-utils';
import { Client } from '@remixproject/plugin';
import { IRemixApi } from '@remixproject/plugin-api';
import { createClient } from '@remixproject/plugin-iframe';
import { InterfaceContract } from './Types';
import Method from './Method';
import { PublicClient, WalletClient } from 'viem';

function getFunctions(abi: AbiItem[]): AbiItem[] {
	const temp: AbiItem[] = [];
	abi.forEach((element: AbiItem) => {
		if (element.type === 'function') {
			temp.push(element);
		}
	});
	return temp;
}

function getArguments(abi: AbiItem | null, args: { [key: string]: string }) {
	const temp: string[] = [];
	if (abi) {
		abi.inputs?.forEach((item: AbiInput) => {
			temp.push(args[item.name]);
		});
	}
	return temp;
}

interface CompilerProps {
	publicClient: PublicClient | null;
	walletClient: WalletClient | null;
	network: string;
	gtag: (name: string) => void;
	busy: boolean;
	setBusy: (state: boolean) => void;
	addNewContract: (contract: InterfaceContract) => void;
	setSelected: (contract: InterfaceContract | null) => void;
	updateBalance: (address: string) => void;
}

const Compiler: React.FunctionComponent<CompilerProps> = ({
	publicClient,
	walletClient,
	network,
	gtag,
	busy,
	setBusy,
	addNewContract,
	setSelected,
	updateBalance,
}) => {
	const [initialised, setInitialised] = React.useState<boolean>(false);
	const [client, setClient] = React.useState<Client<Api, Readonly<IRemixApi>> | undefined | null>(null);
	const [fileName, setFileName] = React.useState<string>('');
	const [iconSpin, setIconSpin] = React.useState<string>('');
	const [contracts, setContracts] = React.useState<{ fileName: string; data: { [key: string]: any } }>({
		fileName: '',
		data: {},
	});
	const [contractName, setContractName] = React.useState<string>('');
	const [constructor, setConstructor] = React.useState<AbiItem | null>(null);
	const [args, setArgs] = React.useState<{ [key: string]: string }>({});
	const [address, setAddress] = React.useState<string>('');
	const [error, setError] = React.useState<string>('');

	React.useEffect(() => {
		async function init() {
			setInitialised(true);
			const temp = createClient();
			await temp.onload();
			temp.solidity.on('compilationFinished', (fn: string, source: any, languageVersion: string, data: any) => {
				setContracts({ fileName: fn, data: data.contracts[fn] });
				select(
					Object.keys(data.contracts[fn]).length > 0 ? Object.keys(data.contracts[fn])[0] : '',
					data.contracts[fn]
				);
			});
			temp.on('fileManager', 'currentFileChanged', (fn: string) => {
				setFileName(fn);
			});
			try {
				setFileName(await temp.fileManager.getCurrentFile());
			} catch (e: unknown) {
				console.log('Error from IDE : No such file or directory No file selected');
			}
			setClient(temp);
		}
		setAddress('');
		if (!initialised) {
			init();
		}
	}, [network]);

	async function compile() {
		setBusy(true);
		setIconSpin('fa-spin');
		await client?.solidity.compile(fileName);
		setIconSpin('');
		setBusy(false);
	}

	function select(name: string, newContracts: { [key: string]: any } | null = null) {
		const abi = newContracts ? newContracts[name].abi : contracts.data[name].abi;
		setContractName(name);
		setConstructor(null);
		setArgs({});
		abi.forEach((element0: AbiItem) => {
			if (element0.type === 'constructor') {
				const temp: { [key: string]: string } = {};
				element0.inputs?.forEach((element1: AbiInput) => {
					temp[element1.name] = '';
				});
				setArgs(temp);
				setConstructor(element0);
			}
		});
		setSelected({ name, address: '', abi: getFunctions(abi) });
	}

	async function onDeploy() {
		if (!busy && publicClient && walletClient) {
			gtag('deploy');
			setBusy(true);
			setAddress('');
			try {
				// @ts-ignore
				const accounts = await walletClient.getAccounts();
				const parms: string[] = getArguments(constructor, args);
				const contractBytecode = `0x${contracts.data[contractName].evm.bytecode.object}`;
				const deployTx = {
					from: accounts[0].address,
					data: contractBytecode,
					arguments: parms,
				};
				// @ts-ignore
				const txHash = await walletClient.sendTransaction(deployTx);
				// @ts-ignore
				const receipt = await publicClient.waitForTransactionReceipt(txHash);
				if (receipt.contractAddress) {
					setAddress(receipt.contractAddress);
					addNewContract({
						name: contractName,
						address: receipt.contractAddress,
						abi: getFunctions(contracts.data[contractName].abi),
					});
				} else {
					setError('contractAddress error');
				}
				updateBalance(accounts[0].address);
			} catch (e: unknown) {
				console.error(e);
				setError('deploy error');
			}
			setBusy(false);
		}
	}

	function Contracts() {
		const { data } = contracts;
		const value = contracts.fileName.split('/')[contracts.fileName.split('/').length - 1];
		const items = Object.keys(data).map((key) => <option key={key} value={key}>{`${key} - ${value}`}</option>);
		return (
			<Form>
				<Form.Group>
					<Form.Text className="text-muted">
						<small>CONTRACT</small>
						<Button
							variant="link"
							size="sm"
							className="mt-0 pt-0 float-right"
							disabled={!contracts.data[contractName]}
							onClick={() => {
								if (contracts.data[contractName]) {
									copy(JSON.stringify(contracts.data[contractName].abi, null, 4));
								}
							}}
						>
							<i className="far fa-copy" />
						</Button>
					</Form.Text>
					<InputGroup>
						<Form.Control
							as="select"
							value={contractName}
							onChange={(e) => {
								select(e.target.value);
							}}
						>
							{items}
						</Form.Control>
					</InputGroup>
				</Form.Group>
			</Form>
		);
	}

	return (
		<div className="Compiler">
			<Button
				variant="primary"
				onClick={async () => {
					await compile();
				}}
				block
				disabled={fileName === '' || iconSpin !== ''}
			>
				<i className={`fas fa-sync ${iconSpin}`} style={{ marginRight: '0.3em' }} />
				<span>
					Compile&nbsp;
					{`${fileName === '' ? '<no file selected>' : fileName.split('/')[fileName.split('/').length - 1]}`}
				</span>
			</Button>
			<hr />
			<Contracts />
			<Card>
				<Card.Header className="p-2">Deploy</Card.Header>
				<Card.Body className="py-1 px-2">
					<Method
						abi={constructor}
						setArgs={(name: string, value: string) => {
							args[name] = value;
						}}
					/>
					<Alert variant="danger" onClose={() => setError('')} dismissible hidden={error === ''}>
						<small>{error}</small>
					</Alert>
					<InputGroup className="mb-3">
						<Form.Control value={address} placeholder="contract address" size="sm" readOnly />
						<InputGroup.Append>
							<Button
								variant="warning"
								block
								size="sm"
								disabled={busy || !(publicClient && walletClient) || fileName === ''}
								onClick={onDeploy}
							>
								<small>Deploy</small>
							</Button>
						</InputGroup.Append>
					</InputGroup>
				</Card.Body>
			</Card>
		</div>
	);
};

export default Compiler;
