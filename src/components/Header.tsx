"use client";

import { useState, useEffect } from "react";
import { FaCrown, FaEthereum } from "react-icons/fa";
import Image from "next/image";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { toast, ToastContainer } from "react-toastify";  // Correct import
import "react-toastify/dist/ReactToastify.css";  // Make sure to import the CSS
import ABI from "./ABI.json";

interface Network {
  name: string;
  chainId: string;
}

interface VipTier {
  id: number;
  name: string;
  price: number;
}

const CONTRACT_ADDRESS = "0x86889B10376dB115763050eba1Ed20b1d4Eb0fd3";

export default function Header() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [ethBalance, setEthBalance] = useState<number>(0);
  const [showWalletOptions, setShowWalletOptions] = useState<boolean>(false);
  const [showNetworkOptions, setShowNetworkOptions] = useState<boolean>(false);
  const [showVipModal, setShowVipModal] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Ethereum Mainnet");
  const [provider, setProvider] = useState<any>(null);
  const [selectedVipTier, setSelectedVipTier] = useState<number | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const networks: Network[] = [
    { name: "Ethereum Mainnet", chainId: "0x1" },
    { name: "BNB Smart Chain", chainId: "0x38" },
    { name: "Polygon (MATIC)", chainId: "0x89" },
  ];

  const vipTiers: VipTier[] = [
    { id: 0, name: "Starter - 1 day", price: 0.1 },
    { id: 1, name: "Professional - 7 days", price: 0.2 },
    { id: 2, name: "Business - 1 month", price: 1.4 },
  ];

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        const balance = await web3Instance.eth.getBalance(accounts[0]);
        const userAddress = accounts[0];

        setWalletAddress(userAddress);
        setEthBalance(Number(web3Instance.utils.fromWei(balance, "ether")));
        setWeb3(web3Instance);
        setShowWalletOptions(false);
        toast.success("Connected to MetaMask successfully!");  // Success Toast
      } catch (error: any) {
        console.error("Error connecting to MetaMask:", error.message);
        toast.error("Error connecting to MetaMask. Please try again.");  // Error Toast
      }
    } else {
      toast.error("MetaMask is not installed. Please install it to connect.");  // Error Toast
    }
  };

  const connectWalletConnect = async () => {
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          421613: "https://arbitrum-sepolia.infura.io/v3/a0b3a1898f1c4fc5b17650f6647cbcd2",
        },
      });

      await walletConnectProvider.enable();
      const web3Instance = new Web3(walletConnectProvider);
      const accounts = await web3Instance.eth.getAccounts();
      const balance = await web3Instance.eth.getBalance(accounts[0]);
      const userAddress = accounts[0];

      setWalletAddress(userAddress);
      setEthBalance(Number(web3Instance.utils.fromWei(balance, "ether")));
      setProvider(walletConnectProvider);
      setWeb3(web3Instance);
      setShowWalletOptions(false);
      toast.success("Connected to WalletConnect successfully!");  // Success Toast
    } catch (error: any) {
      console.error("Error connecting to WalletConnect:", error.message);
      toast.error("Error connecting to WalletConnect. Please try again.");  // Error Toast
    }
  };

  const disconnectWallet = async () => {
    if (provider) {
      await provider.disconnect();
      setProvider(null);
    }
    setWalletAddress("");
    setEthBalance(0);
    toast.success("Disconnected from wallet successfully.");  // Success Toast
  };

  const isTierActive = (price: number) => ethBalance >= price;

  const changeNetwork = async (network: Network) => {
    try {
      const { chainId } = network;
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        setSelectedNetwork(network.name);
        setShowNetworkOptions(false);
        toast.success(`Switched to ${network.name} network.`);  // Success Toast
      } else {
        toast.error("MetaMask is not installed. Please install it to change networks.");  // Error Toast
      }
    } catch (error: any) {
      console.error("Error switching networks:", error.message);
      if (error.code === 4902) {
        toast.error("Network not added to MetaMask. Please add it manually.");  // Error Toast
      } else {
        toast.error("Error switching networks. Please try again.");  // Error Toast
      }
    }
  };

  const buyVip = async () => {
    if (selectedVipTier === null) {
      toast.error("Please select a VIP tier.");  
      return;
    }
    if (!web3 || !walletAddress) {
      toast.error("Wallet not connected. Please connect your wallet."); 
      return;
    }

    try {
      const contract = new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS);
      const selectedTier = vipTiers.find((tier) => tier.id === selectedVipTier);

      if (!selectedTier) {
        toast.error("Invalid VIP tier selected.");
        return;
      }

      const priceInWei = web3.utils.toWei(selectedTier.price.toString(), "ether");
      await contract.methods.becomeVip(selectedVipTier).send({
        from: walletAddress,
        value: priceInWei,
      });

      toast.success(`Successfully purchased the ${selectedTier.name} VIP pack.`); 
      setShowVipModal(false);
    } catch (error: any) {
      console.error("VIP purchase error:", error.message);
      toast.error("Transaction failed. Please try again.");
    }
  };


  return (
    <>
    <header className="w-full bg-gradient-to-r from-[#1e293b] to-[#0F123D] bg-opacity-80 text-white shadow-md">
      <div className="flex flex-wrap justify-between items-center px-4 py-3 md:px-6 lg:px-8">
        <div className="text-2xl font-bold mb-2 sm:mb-0">
          Ledgerline Multisender
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            className="text-green-500 border border-green-500 text-xs hover:bg-green-900 px-4 font-bold py-2 rounded-xl flex items-center gap-1"
            onClick={() => setShowVipModal(true)}
          >
            <FaCrown /> VIP
          </button>

          <button
            onClick={() => setShowNetworkOptions(true)}
            className="bg-[#0F123D] border border-blue-500 text-blue-500 text-xs hover:bg-sky-900 font-bold px-3 py-2 rounded-xl flex items-center gap-1"
          >
            <FaEthereum /> {selectedNetwork.split(" ")[0]}
          </button>
          {walletAddress ? (
            <div className="bg-[#0F123D] text-white text-xs border border-blue-500 px-3 py-2 hover:bg-sky-900 rounded-xl flex items-center gap-1">
              <div className="font-bold text-blue-400">
                {walletAddress.slice(0, 8)}...
              </div>
              <div className="ml-2 font-bold text-blue-400">
                {ethBalance.toFixed(4)} ETH
              </div>
              <button
                onClick={disconnectWallet}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletOptions(true)}
              className="bg-[#0F123D] text-blue-500 text-xs border border-blue-500 px-3 hover:bg-sky-900 font-bold py-2 rounded-xl flex items-center gap-1"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Wallet Options Modal */}
      {showWalletOptions && (
        <div className="fixed inset-0 bg-[#0F123D] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowWalletOptions(false)}
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-100"
            >
              &times;
            </button>
            <h3 className="text-lg text-blue-500 font-bold mb-4">Connect Wallet</h3>
            <button
              onClick={connectMetaMask}
              className="block w-full text-left px-4 py-2 bg-gray-600 text-blue-300 rounded-lg mb-2 hover:text-gray-100 hover:bg-gray-400"
            >
              <Image src="/metamask.png" alt="MetaMask" width={20} height={20} className="inline mr-2" />
              MetaMask
            </button>
            <button
              onClick={connectWalletConnect}
              className="block w-full text-left px-4 py-2 bg-gray-600 text-blue-300 rounded-lg mb-2 hover:text-gray-100 hover:bg-gray-400"
            >
              <Image src="/walletconnect.jpg" alt="WalletConnect" width={20} height={20} className="inline mr-2" />
              WalletConnect
            </button>
          </div>
        </div>
      )}

      {/* Network Options Modal */}
      {showNetworkOptions && (
        <div className="fixed inset-0 bg-[#0F123D] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowNetworkOptions(false)}
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-100"
            >
              &times;
            </button>
            <h3 className="text-lg text-blue-500 font-bold mb-4">Select Network</h3>
            <div className="space-y-2">
              {networks.map((network) => (
                <button
                  key={network.chainId}
                  onClick={() => changeNetwork(network)}
                  className="block w-full px-4 py-2 bg-gray-600 text-blue-300 rounded-lg mb-2 hover:text-gray-100 hover:bg-gray-400"
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      {showVipModal && (
        <div className="fixed inset-0 bg-[#0F123D] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-700 rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-100"
            >
              &times;
            </button>
            <h3 className="text-lg text-blue-500 font-bold mb-4">VIP</h3>
            <p className="text-slate-400 text-sm mb-4">
              VIP gives you discounted access to Ledgerline Multisender.app, and all your
              transactions will be free.
            </p>
            <div className="space-y-3">
              {vipTiers.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedVipTier(tier.id)}
                  className={`flex items-center gap-2 border rounded-lg p-2 ${
                    isTierActive(tier.price)
                      ? "border-green-500 bg-green-800"
                      : "border-gray-500 bg-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    id={tier.id}
                    name="vip"
                    disabled={!isTierActive(tier.price)}
                  />
                  <label
                    htmlFor={tier.id}
                    className={`text-sm cursor-pointer ${
                      isTierActive(tier.price) ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    {tier.name} - {tier.price} ETH
                  </label>
                  {!isTierActive(tier.price) && (
                    <span className="text-red-500 text-xs ml-auto">
                      Insufficient Balance
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              className="bg-blue-500 w-full mt-3 text-white py-2 rounded"
              disabled={!walletAddress}
              onClick={buyVip}
            >
              {walletAddress ? "Buy" : "Connect Wallet First"}
            </button>
          </div>
        </div>
      )}
    </header>
    <ToastContainer />
    </>
  );
}
