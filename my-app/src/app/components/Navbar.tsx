import React, { useEffect, useState } from "react";
import { FaTicketAlt, FaCalendarAlt, FaCompass, FaSearch, FaBell } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsPersonCircle } from "react-icons/bs";
import { IconContext } from "react-icons";
import Link from "next/link";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import Token from "../contractInfo/contractAbi.json"
import contractAddress from "../contractInfo/contract.json"



declare global {
  interface Window {
    ethereum?: any; // Declare the ethereum object
  }
}

const Navbar: React.FC = () => {
  const [time, setTime] = useState<string>("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const mint = async (a = "500") => {
    const abi = Token.abi;
    const charge = a;
    console.log(charge, "=========deposit=========");
    // const contractAddress = "0xcA03Dc4665A8C3603cb4Fd5Ce71Af9649dC00d44"
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const questContract = new ethers.Contract(contractAddress.address, abi, signer)
    // mint();
    // console.log(balance, "========inside withdraw===")

    await (await questContract.mint(address, ethers.parseUnits(parseInt(charge).toString(), 18))).wait();
    // alert('Withdraw your earned EVO coins!');
    // await (await bounceContract.transfer(address, ethers.utils.parseUnits(charge.toString(), 18))).wait();
  }
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        mint()
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gradient-to-b from-purple-600 to-purple-800 p-4 flex items-center justify-between text-white">
      {/* Left Section: Navigation Links */}
      <div className="flex items-center space-x-6">
        <IconContext.Provider value={{ size: "1.2em" }}>
          {/* <a href="#" className="flex items-center space-x-1 hover:text-gray-300"> */}
            <FaTicketAlt />
            <span>
              <Link href="/events">
              Events
              </Link>
              </span>
          {/* </a> */}
          <a href="#" className="flex items-center space-x-1 hover:text-gray-300">
            <FaCalendarAlt />
            <span>Calendars</span>
          </a>
          <a href="#" className="flex items-center space-x-1 hover:text-gray-300">
            <FaCompass />
            <span>Discover</span>
          </a>
        </IconContext.Provider>
      </div>

      {/* Center Section: Logo */}
      <div className="flex-1 flex justify-center">
        <span className="text-2xl font-bold">✨ Evion</span>
      </div>

      {/* Right Section: Time, Create Event Button, and Icons */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-300">{time}</span>
        <button className="bg-blue-600 hover:bg-blue-700 text-sm font-semibold px-4 py-2 rounded-lg">
          <Link href="/create">
          Create Event
          </Link>
        </button>
        {!walletConnected ? (
        <button onClick={connectWallet} className="bg-purple-600 hover:bg-purple-700 text-sm font-semibold px-4 py-2 rounded-lg shadow transition duration-150">
          Connect Wallet
        </button>
        ) : (
          <button className="bg-purple-600 hover:bg-purple-700 text-sm font-semibold px-4 py-2 rounded-lg shadow transition duration-150">
          {walletAddress.slice(0, 5) + '...' + walletAddress.slice(-4)}
        </button>
        )}
      
        {/* <div className="flex items-center space-x-4"> */}
          {/* <FaSearch className="cursor-pointer hover:text-gray-300" />
          <IoMdNotificationsOutline className="cursor-pointer hover:text-gray-300" />
          <span className="relative">
            <FaBell className="cursor-pointer hover:text-gray-300" />
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </span>
          <BsPersonCircle className="text-2xl cursor-pointer hover:text-gray-300" /> */}
        {/* </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
