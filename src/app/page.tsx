"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { FaCrown, FaEthereum, FaCoins, FaFileCsv } from "react-icons/fa";
import Image from "next/image";
import Web3 from "web3";
import Link from "next/link";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

interface Token {
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

export default function Home() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [lineNumbers, setLineNumbers] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(1);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<string>("");
  const [csvError, setCsvError] = useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  useEffect(() => {
    const updateLineNumbers = () => {
      const lines = csvText.split("\n");
      return lines.map((_, index) => index + 1).join("\n");
    };
    setLineNumbers(updateLineNumbers());
  }, [csvText]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCsvText(result);
        validateCsv(result);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleCsvTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setCsvText(value);
    validateCsv(value);
  };

  const validateCsv = (csvData: string) => {
    const lines = csvData.split("\n");
    const isValid = lines.every((line) => {
      const [address] = line.split(",").map((item) => item.trim());
      return address && address.length === 42;
    });
    setCsvError(!isValid);
  };

  const showCsvFormat = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const parseCsv = () => {
    const lines = csvText.split("\n");
    const valid: { address: string; amount: string }[] = [];
    const invalid: { address: string; amount: string }[] = [];
    lines.forEach((line) => {
      const [address, amount] = line.split(",").map((item) => item.trim());
      if (address && address.length === 42) {
        valid.push({ address, amount });
      } else {
        invalid.push({ address, amount });
      }
    });
    return { valid, invalid };
  };

  const fetchTokens = async (address: string, chainId: string) => {
    let chain: EvmChain | undefined;
    const parsedChainId = parseInt(chainId, 16);
    switch (parsedChainId) {
      case 10200:
        chain = EvmChain.GNOSIS_TESTNET;
        break;
      case 17000:
        chain = EvmChain.HOLESKY;
        break;
      case 56:
        chain = EvmChain.BSC;
        break;
      case 80001:
        chain = EvmChain.MUMBAI;
        break;
      case 137:
        chain = EvmChain.POLYGON;
        break;
      case 80002:
        chain = EvmChain.POLYGON_AMOY;
        break;
      case 1:
        chain = EvmChain.ETHEREUM;
        break;
      default:
        alert("Unsupported network. Please connect to a supported network.");
        return;
    }

    try {
      await Moralis.start({ apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Ijk2Yzg5ZjcwLWRiN2UtNDE3MC05Y2UxLTZmZGFmNDkwYjg4NCIsIm9yZ0lkIjoiMzA2NjUyIiwidXNlcklkIjoiMzE1MDIwIiwidHlwZUlkIjoiMGYxNzcxMjMtYzVkZC00MTY3LWE0NzYtZjM0NWEyMzNkZmNmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE2ODczMjE3MDcsImV4cCI6NDg0MzA4MTcwN30.H_LYqFvB7WFYf0kn7eVU_EIy1YzRFivFyhhz84hr8nM" });
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      });
      setTokens(response.toJSON());
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const balance = await web3.eth.getBalance(accounts[0]);
        const chainId = await window.ethereum.request({ method: "eth_chainId" });

        setWalletAddress(accounts[0]);
        setEthBalance(web3.utils.fromWei(balance, "ether"));
        fetchTokens(accounts[0], chainId);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to connect.");
    }
  };

  const handleTokenClick = (token: Token) => {
    setSelectedToken(token.name);
    setDropdownVisible(false);
  };

  const csvExample = [
    "0xd88d0f22f9bc682afa550da99062b3865088386d, 0.000056",
    "pavlik.eth, 12",
    "0x64c9525A3c3a65Ea88b06f184F074C2499578A7E, 1",
    "0xC8c30Fa803833dD1Fd6DBCDd91Ed0b301EFf87cF, 13.45",
    "0x7D52422D3A5fE9bC92D3aE8167097eE09F1b347d, 1.049",
  ];

  const { valid, invalid } = parseCsv();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1e293b] to-[#0F123D] bg-opacity-80 text-white flex flex-col items-center">
      <main className="flex flex-col items-center mt-10 w-full max-w-2xl  rounded-2xl  p-6">
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`flex items-center gap-2 ${
              status >= 1 ? "bg-green-500" : "bg-gray-500"
            } text-white rounded-full w-8 h-8 justify-center `} 
          >
            <span>1</span>
          </div>
          <div className="text-xs font-bold text-blue-700">Prepare</div>
          <div className="h-6 border-l border-gray-500"></div>
          <div className="h-6"></div>
          <div
            className={`flex items-center gap-2 ${
              status >= 2 ? "bg-green-500" : "bg-gray-500"
            } text-white rounded-full w-8 h-8 justify-center`}
          >
            <span>2</span>
          </div>
          <div className="text-xs font-bold text-blue-700">Approve</div>
          <div className="h-6 border-l border-gray-500"></div>
          <div
            className={`flex items-center gap-2 ${
              status >= 3 ? "bg-green-500" : "bg-gray-500"
            } text-white rounded-full w-8 h-8 justify-center`}
          >
            <span>3</span>
          </div>
          <div className="text-xs font-bold text-blue-700">Multisend</div>
        </div>

        <div className="w-full bg-gradient-to-r from-[#1e293b] to-[#0F123D] bg-opacity-80 border border-blue-700 rounded-lg p-4">
          <div className="w-full mb-6 ">
            <label className="block text-xs font-bold mb-2">Token Address</label>
            <div className="flex items-center gap-2">
               <div className="relative w-full">
            <div className="flex items-center">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-lg">
                  <FaCoins />
                </span>
                <input
                  type="text"
                  placeholder="Select your Token"
                  className="w-full bg-[#0F123D] text-white px-10 py-2 rounded border border-gray-500"
                  value={selectedToken}
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                  readOnly
                />
              </div>
            </div>
            {dropdownVisible && (
              <div className="absolute w-full bg-[#1e293b] text-white border border-gray-600 rounded-md mt-2 max-h-60 overflow-y-auto z-10">
              {tokens.map((token, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-4"
                  onClick={() => handleTokenClick(token)}
                >
                  <span className="text-xs text-gray-100">{token.name}</span>
                  <span className="font-bold">{token.symbol}</span>
                  
                  <span className="text-sm text-gray-100">
                    {parseFloat(token.balance) / Math.pow(10, token.decimals)}
                  </span>
                </div>
              ))}
            </div>
            
            )}
          </div>
        
      
              <div>
                <input type="checkbox" id="deflationary" className="mr-2" />
                <label htmlFor="deflationary">Deflationary</label>
              </div>
            </div>
          </div>

          <div className="w-full mt-6 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold mb-2">
                List of Addresses in CSV
              </label>
              <button
                onClick={showCsvFormat}
                className="bg-[#0F123D] text-sky-400 font-bold px-3 py-1 rounded text-xs"
              >
                Show CSV Format
              </button>
            </div>
            <div className="flex border border-gray-500 rounded h-32 overflow-hidden">
      <pre
        className="text-gray-500 px-3 py-2 text-right"
        style={{ minWidth: "2.5rem" }}
      >
        {lineNumbers}
      </pre>
      <textarea
        placeholder="Insert your CSV here"
        className={`w-full bg-[#0F123D] text-white px-4 py-2 rounded-none resize-none h-32 ${
          csvText ? "border-gray-500" : "border-red-500"
        }`}
        value={csvText}
        onChange={handleCsvTextChange}
      />
    </div>
            <div className="absolute right-2 bottom-[-1rem]">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="uploadCSV"
                required
              />
              <label
                htmlFor="uploadCSV"
                className="flex items-center bg-[#0F123D] text-sky-400 text-xs font-bold px-4 py-2 rounded cursor-pointer border border-gray-500 border-t-0"
              >
                <FaFileCsv className="mr-2" /> Upload CSV
              </label>
            </div>
          </div>

          <div className="mt-8">
            {walletAddress ? (
              <Link
                href={{
                  pathname: "/approve",
                  query: {
                    validAddresses: JSON.stringify(valid),
                    invalidAddresses: JSON.stringify(invalid),
                  },
                }}
              >
                <button className="bg-green-500 hover:bg-green-600 text-white w-full font-bold py-2 rounded-xl">
                  Continue
                </button>
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-sky-500/50 hover:bg-blue-600 text-white w-full font-bold py-2 rounded-xl"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-[#0F123D] text-white rounded-lg p-6 max-w-4xl w-full border-4 border-gray-500">
            <h3 className="text-lg font-bold mb-4">CSV Format Example</h3>
            <div className="space-y-2">
              {csvExample.map((line, index) => (
                <div key={index} className="flex border-b border-gray-500 py-2">
                  <span className="w-12 text-right text-gray-300">
                    {index + 1}.
                  </span>
                  <span className="text-gray-500">{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-red-500 font-bold" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}