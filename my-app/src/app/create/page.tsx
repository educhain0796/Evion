"use client";
import React, { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import Token from "../contractInfo/contractAbi.json"
import contractAddress from "../contractInfo/contract.json"
import { toast } from "sonner";
import { StoryClient, aeneid, PILFlavor, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { createWalletClient, custom, parseEther } from "viem";

interface EventData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  isPublic: boolean;
  imageUrl: string;
  isFree: boolean;
  requiresApproval: boolean;
  capacity: string;
  ipfsUri?: string;
  ipAssetId?: string;
  ipAccount?: string;
}

const CreateEvent = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>('https://png.pngtree.com/thumb_back/fh260/background/20230721/pngtree-3d-rendering-of-a-launching-rocket-image_3777838.jpg');
  const [isDragging, setIsDragging] = useState(false);
  const [spgMode, setSpgMode] = useState<"default" | "existing" | "new">("default");
  const [spgAddress, setSpgAddress] = useState("");
  const [spgName, setSpgName] = useState("");
  const [spgSymbol, setSpgSymbol] = useState("");
  const [spgContractURI, setSpgContractURI] = useState("");
  const [spgCreatedAddress, setSpgCreatedAddress] = useState("");
  const [isCreatingSpg, setIsCreatingSpg] = useState(false);
  const defaultSpg = "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc"; // aeneid default
  const [licenseType, setLicenseType] = useState<"nonCommercial" | "commercial">("nonCommercial");
  const [revShare, setRevShare] = useState("0");
  const [mintFee, setMintFee] = useState("0");
  const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);

  const [eventData, setEventData] = useState<EventData>({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    isPublic: true,
    imageUrl: 'https://png.pngtree.com/thumb_back/fh260/background/20230721/pngtree-3d-rendering-of-a-launching-rocket-image_3777838.jpg',
    isFree: true,
    requiresApproval: false,
    capacity: 'Unlimited',
    ipfsUri: undefined
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file: File) => {
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setUploadedImageUri(null); // reset so we re-upload on submit
        setEventData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const uploadMetadata = async (ipMetadata: any, nftMetadata: any) => {
    const res = await fetch("/api/story/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipMetadata, nftMetadata }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to upload metadata");
    }
    return data as {
      ipIpfsHash: string;
      nftIpfsHash: string;
      ipHash: string;
      nftHash: string;
      ipMetadataURI: string;
      nftMetadataURI: string;
    };
  };

  const uploadContractMetadata = async (contractMetadata: any) => {
    const res = await fetch("/api/story/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractMetadata }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to upload contract metadata");
    }
    return data as {
      contractMetadataURI: string;
      contractHash?: string;
      contractIpfsHash?: string;
    };
  };

  const createSpgCollection = async (baseEvent: EventData) => {
    if (isCreatingSpg) return;
    if (!window.ethereum) {
      toast.error("Please install MetaMask to create a collection.");
      return;
    }
    if (!spgName || !spgSymbol) {
      toast.error("SPG name and symbol are required to create a new collection.");
      return;
    }
    try {
      setIsCreatingSpg(true);
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const creatorAddress = await signer.getAddress();

      const walletClient = createWalletClient({
        account: creatorAddress as `0x${string}`,
        chain: aeneid,
        transport: custom(window.ethereum),
      });
      const storyClient = StoryClient.newClient({
        account: walletClient.account,
        transport: custom(window.ethereum),
        chainId: "aeneid",
      });

      let contractURIToUse = spgContractURI;
      if (!contractURIToUse) {
        const contractMeta = {
          name: spgName,
          description: baseEvent.description || "Event collection",
          image: baseEvent.imageUrl,
          external_link: baseEvent.imageUrl,
        };
        const uploadedContract = await uploadContractMetadata(contractMeta);
        contractURIToUse = uploadedContract.contractMetadataURI;
      }

      const spgToast = toast.loading("Creating SPG collection...");
      const created = await storyClient.nftClient.createNFTCollection({
        name: spgName,
        symbol: spgSymbol,
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: ethers.ZeroAddress,
        contractURI: contractURIToUse || "",
      });
      setSpgCreatedAddress(created.spgNftContract);
      toast.success(`SPG created: ${created.spgNftContract}`, { id: spgToast });
    } catch (error) {
      console.error("Failed to create SPG:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Unable to create SPG. ${message}`);
    } finally {
      setIsCreatingSpg(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to create an event.");
        return;
      }

      const baseEvent: EventData = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        isPublic,
      };

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const creatorAddress = await signer.getAddress();

      const walletClient = createWalletClient({
        account: creatorAddress as `0x${string}`,
        chain: aeneid,
        transport: custom(window.ethereum),
      });
      const storyClient = StoryClient.newClient({
        account: walletClient.account,
        transport: custom(window.ethereum),
        chainId: "aeneid",
      });

      let spgAddressToUse: string | undefined = undefined;
      if (spgMode === "existing") {
        if (!spgAddress) {
          toast.error("Please enter an SPG address.");
          return;
        }
        spgAddressToUse = spgAddress;
      } else if (spgMode === "new") {
        if (!spgCreatedAddress) {
          toast.error("Create the SPG collection first, then create the event.");
          return;
        }
        spgAddressToUse = spgCreatedAddress;
      } else {
        spgAddressToUse = defaultSpg;
      }

      const storyToastId = toast.loading("Registering event on Story Protocol...");
      let imageUri = uploadedImageUri || baseEvent.imageUrl;
      // If image is a data URL, upload it to IPFS
      if (imageUri.startsWith("data:")) {
        try {
          const upToast = toast.loading("Uploading image to IPFS...");
          const res = await fetch("/api/story/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl: imageUri, filename: "event-image.png" }),
          });
          const data = await res.json();
          if (res.ok) {
            imageUri = data.uri;
            setUploadedImageUri(data.uri);
            toast.success("Image uploaded to IPFS", { id: upToast });
          } else {
            toast.error(data.error || "Image upload failed", { id: upToast });
            return;
          }
        } catch (err) {
          console.error("Image upload failed", err);
          toast.error("Image upload failed");
          return;
        }
      }
      const ipMetadata = {
        title: baseEvent.name || "Untitled Event",
        description: baseEvent.description || "Event description",
        createdAt: `${Math.floor(Date.now() / 1000)}`,
        creators: [
          {
            name: baseEvent.name || "Creator",
            address: creatorAddress,
            contributionPercent: 100,
          },
        ],
        image: imageUri,
        mediaUrl: imageUri,
        mediaType: "image/jpeg",
      };

      const nftMetadata = {
        name: baseEvent.name || "Event NFT",
        description: baseEvent.description || "Event NFT description",
        image: imageUri,
        attributes: [
          { trait_type: "Location", value: baseEvent.location || "Unknown" },
          { trait_type: "Public", value: baseEvent.isPublic ? "Yes" : "No" },
          { trait_type: "Capacity", value: baseEvent.capacity || "Unlimited" },
        ],
      };

      const uploaded = await uploadMetadata(ipMetadata, nftMetadata);

      const response = await storyClient.ipAsset.registerIpAsset({
        nft: { type: "mint", spgNftContract: spgAddressToUse! },
        licenseTermsData: [
          {
            terms:
              licenseType === "nonCommercial"
                ? PILFlavor.nonCommercialSocialRemixing()
                : PILFlavor.commercialRemix({
                    commercialRevShare: Number(revShare || "0"),
                    defaultMintingFee: parseEther(mintFee || "0"),
                    currency: WIP_TOKEN_ADDRESS,
                  }),
          },
        ],
        ipMetadata: {
          ipMetadataURI: uploaded.ipMetadataURI,
          ipMetadataHash: `0x${uploaded.ipHash}`,
          nftMetadataURI: uploaded.nftMetadataURI,
          nftMetadataHash: `0x${uploaded.nftHash}`,
        },
      });
      toast.success("Event registered on Story Protocol", { id: storyToastId });

      const newEvent: EventData = {
        ...baseEvent,
        ipfsUri: uploaded.ipMetadataURI,
        ipAssetId: response.ipId,
        ipAccount: response.ipAccount,
      };

      const transferToastId = toast.loading("Transferring 1 EVO to community wallet...");
      const transferReceipt = await donate(1, signer);
      toast.success(
        `Transfer confirmed (1 EVO). Tx: ${transferReceipt?.hash?.slice(0, 10)}...`,
        { id: transferToastId }
      );

      const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
      localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));

      toast.success("Event created successfully!");
      setTimeout(() => router.push('/events'), 400);
    } catch (error) {
      console.error("Failed to create event:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Unable to create event. ${message}`);
    }

  };

  const donate = async (a = 1, externalSigner?: ethers.Signer) => {
    const abi = Token.abi;
    const charge = a.toString();
    console.log(charge, "=========deposit=========");
    const signer = externalSigner ?? await new BrowserProvider(window.ethereum).getSigner();
    const address = await signer.getAddress()

    // Normalize recipient to a valid checksummed address
    const recipient = ethers.getAddress("0xf67066165b1a831837da557bf5df1e0ac93e87e2");

    const questContract = new ethers.Contract(contractAddress.address, abi, signer)

    const tx = await questContract.transfer(recipient, ethers.parseUnits(parseInt(charge).toString(), 18));
    const receipt = await tx.wait();
    return receipt;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 via-purple-900 to-black flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-gradient-to-br from-black via-gray-800 to-purple-900 text-gray-100 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-700">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-semibold">Personal Calendar</span>
          <span
            className="text-gray-300 cursor-pointer font-medium px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            onClick={() => setIsPublic(!isPublic)}
          >
            {isPublic ? "Public" : "Private"}
          </span>
        </div>

        {/* Event Image Upload Section */}
        <div 
          className={`relative rounded-xl overflow-hidden shadow-lg ${isDragging ? 'border-2 border-purple-500' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="relative h-52">
            <img
              src={imagePreview}
              alt="Event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <p className="text-white text-center mb-2">
                Drag & Drop an image or click to upload
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Choose File
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </div>

        {/* Event Name */}
        <input
          type="text"
          name="name"
          value={eventData.name}
          onChange={handleInputChange}
          placeholder="Event Name"
          className="w-full bg-gray-800 text-white text-2xl font-semibold rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
        />

        {/* License Terms */}
        <div className="space-y-3 border border-gray-700 rounded-lg p-4 bg-gray-900/40">
          <div className="text-sm text-gray-300 font-semibold">License Type</div>
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value as "nonCommercial" | "commercial")}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150"
          >
            <option value="nonCommercial">Non-Commercial Social Remix</option>
            <option value="commercial">Commercial Remix</option>
          </select>
          {licenseType === "commercial" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <label className="text-gray-400">Revenue Share (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={revShare}
                  onChange={(e) => setRevShare(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400">Default Minting Fee (IP)</label>
                <input
                  type="number"
                  min="0"
                  value={mintFee}
                  onChange={(e) => setMintFee(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* SPG Collection Settings */}
        <div className="space-y-3 border border-gray-700 rounded-lg p-4 bg-gray-900/40">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300 font-semibold">SPG Collection</span>
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="spgMode"
                  value="default"
                  checked={spgMode === "default"}
                  onChange={() => setSpgMode("default")}
                />
                Default (aeneid)
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="spgMode"
                  value="existing"
                  checked={spgMode === "existing"}
                  onChange={() => setSpgMode("existing")}
                />
                Existing
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="spgMode"
                  value="new"
                  checked={spgMode === "new"}
                  onChange={() => setSpgMode("new")}
                />
                Create new
              </label>
            </div>
          </div>

          {spgMode === "existing" && (
            <input
              type="text"
              value={spgAddress}
              onChange={(e) => setSpgAddress(e.target.value)}
              placeholder="Existing SPG address (0x...)"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
            />
          )}

          {spgMode === "new" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={spgName}
                onChange={(e) => setSpgName(e.target.value)}
                placeholder="SPG Name"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
              />
              <input
                type="text"
                value={spgSymbol}
                onChange={(e) => setSpgSymbol(e.target.value)}
                placeholder="Symbol (e.g. EVNT)"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
              />
              <input
                type="text"
                value={spgContractURI}
                onChange={(e) => setSpgContractURI(e.target.value)}
                placeholder="Contract URI (optional IPFS/URL)"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
              />
            </div>
          )}
          {spgMode === "new" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => createSpgCollection({
                  ...eventData,
                  id: eventData.id || "temp",
                  isPublic,
                })}
                disabled={isCreatingSpg}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold px-4 py-2 rounded-lg shadow transition duration-150"
              >
                {isCreatingSpg ? "Creating..." : "Create SPG Collection"}
              </button>
              {spgCreatedAddress && (
                <span className="text-xs text-green-300 break-all">
                  Created: {spgCreatedAddress}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Date and Time */}
        <div className="flex justify-between items-center space-x-4">
          <div className="w-1/2">
            <label className="block text-gray-400 text-sm">Start</label>
            <input
              type="datetime-local"
              name="startDate"
              value={eventData.startDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2 mt-1 outline-none border border-gray-600 focus:border-purple-500 transition duration-150"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-400 text-sm">End</label>
            <input
              type="datetime-local"
              name="endDate"
              value={eventData.endDate}
              onChange={handleInputChange}
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2 mt-1 outline-none border border-gray-600 focus:border-purple-500 transition duration-150"
            />
          </div>
        </div>

        {/* Event Location */}
        <input
          type="text"
          name="location"
          value={eventData.location}
          onChange={handleInputChange}
          placeholder="Add Event Location"
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
        />

        {/* Description */}
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleInputChange}
          placeholder="Add Description"
          className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-purple-500 transition duration-150 placeholder-gray-400"
          rows={3}
        ></textarea>

        {/* Event Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Tickets</span>
            <span className="text-white">Free</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Require Approval</span>
            <input
              type="checkbox"
              checked={eventData.requiresApproval}
              onChange={(e) => setEventData(prev => ({
                ...prev,
                requiresApproval: e.target.checked
              }))}
              className="form-checkbox text-purple-600 rounded focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Capacity</span>
            <span className="text-white">Unlimited</span>
          </div>
        </div>

        {/* Create Event Button */}
        <button
          onClick={handleCreateEvent}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold mt-4 shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105 duration-150"
        >
          Create Event
        </button>
      </div>
    </div>
  );
};

export default CreateEvent;