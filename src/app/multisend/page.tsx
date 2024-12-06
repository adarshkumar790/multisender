"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { CalculatorIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const router = useRouter();

  const [totalAddresses, setTotalAddresses] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const gasCostPerTransaction = 0.00016;
  const gasPrice = 3;

  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    setIsHydrated(true);

    const urlParams = new URLSearchParams(window.location.search);
    const addresses = urlParams.get("totalAddresses");
    const amount = urlParams.get("totalAmount");

    if (addresses && amount) {
      setTotalAddresses(Number(addresses));
      setTotalAmount(Number(amount));
    }
  }, [router.query]);

  const [currentStep, setCurrentStep] = useState<number>(2);

  const totalTransactions = totalAddresses;
  const approximateCost = totalTransactions * gasCostPerTransaction;
  const totalGasPrice = gasPrice;

  const handleCalculationRedirect = () => {
    router.push("https://www.alchemy.com/gwei-calculator");
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center bg-[#0F1A44] min-h-screen">
      <div className="mt-4 mb-4 max-w-2xl p-8 bg-[#0F1A44]">
        <div className="flex flex-wrap justify-center items-center mb-8 gap-4">
          <StepIndicator step={1} currentStep={currentStep} label="Prepare" />
          <div className="h-6 border-l border-gray-500"></div>
          <StepIndicator step={2} currentStep={currentStep} label="Approve" />
          <div className="h-6 border-l border-gray-500"></div>
          <StepIndicator step={3} currentStep={currentStep} label="Multisend" />
        </div>

        {/* Promo Code Section */}
        <div className="bg-[#16204D] p-6 border border-blue-700 rounded-lg mb-6 mt-4">
          <p className="text-sm text-gray-400 mb-2">
            Do you have a promo code? Enter now to get a discount!
          </p>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Promo Code"
              className="flex-1 p-2 rounded-l-lg text-gray-900 outline-none"
            />
            <button className="bg-[#1F3AB5] text-white px-4 py-2 rounded-r-lg">
              Activate
            </button>
          </div>
        </div>

        <div className="mt-8 text-center mb-5 border border-blue-700 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            <SummaryItem
              value={totalAddresses}
              description="Total number of addresses"
            />
            <SummaryItem
              value={`${totalAmount} BNB`}
              description="Total number of tokens to be sent"
            />
            <SummaryItem
              value={totalTransactions}
              description="Total number of transactions needed"
            />
            <SummaryItem
              value={`${(totalAmount - approximateCost).toFixed(4)} BNB`}
              description="Your BNB balance"
            />
            <SummaryItem
              value={`${approximateCost.toFixed(4)} BNB`}
              description="Approximate cost of operation"
            />
            <SummaryItem
              value={
                <div className="flex items-center justify-between">
                  <span>{`${totalGasPrice} Gwei`}</span>
                  {/* <CalculatorIcon
                    className="w-6 h-6 text-blue-400 cursor-pointer hover:text-blue-500"
                    onClick={handleCalculationRedirect}
                  /> */}
                </div>
              }
              description="Selected network speed (Gas Price)"
            />
          </div>

          <button className="w-full py-3 bg-[#1F3AB5] text-white font-semibold rounded-lg hover:bg-[#2A4BF2]">
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
}

function StepIndicator({ step, currentStep, label }: StepIndicatorProps) {
  const isActive = currentStep >= step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full w-8 h-8 text-white ${
          isActive ? "bg-green-500" : "bg-gray-500"
        }`}
      >
        <span>{step}</span>
      </div>
      <div className="text-xs font-bold text-blue-700">{label}</div>
    </div>
  );
}

interface SummaryItemProps {
  value: React.ReactNode;
  description: string;
}

function SummaryItem({ value, description }: SummaryItemProps) {
  return (
    <div className="p-4 bg-[#16204D] rounded-lg border border-blue-700">
      <p className="text-lg font-semibold text-blue-400">{value}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
