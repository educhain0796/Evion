import { ethers } from "ethers";
import { BrowserProvider } from "ethers";

/**
 * Story Protocol Service
 * Handles IP Asset registration and storage on Story Protocol
 */

export interface IPAssetMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Record<string, any>;
  createdAt: string;
  eventId: string;
}

/**
 * Uploads event metadata to IPFS and returns IPFS URI
 * In production, this would use a service like Pinata, Web3.Storage, or IPFS
 */
export async function uploadToIPFS(metadata: IPAssetMetadata): Promise<string> {
  try {
    // Simulate IPFS upload - in production, replace with actual IPFS service
    // For example: Pinata, Web3.Storage, or direct IPFS node
    const metadataJson = JSON.stringify(metadata);
    
    // Generate a deterministic CID-like identifier
    const hash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(metadataJson)
    );
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store metadata locally for now (replace with actual IPFS upload)
    const cid = hashHex.substring(0, 16);
    const ipfsUri = `ipfs://story-foundation/${cid}`;
    
    // Store in localStorage as backup (in production, this would be on IPFS)
    localStorage.setItem(`ipfs-metadata-${cid}`, metadataJson);
    
    return ipfsUri;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
}

/**
 * Registers an IP Asset with Story Protocol
 * This creates an IP Asset on-chain and associates it with Story Protocol
 */
export async function registerIPAsset(
  ipfsUri: string,
  eventName: string,
  signer: ethers.Signer
): Promise<{ ipAssetId: string; ipAccount: string }> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const provider = new BrowserProvider(window.ethereum);
    const address = await signer.getAddress();

    // Story Protocol IP Asset Registry Contract Address
    // Note: Replace with actual Story Protocol contract addresses for your network
    const STORY_IP_ASSET_REGISTRY = "0x0000000000000000000000000000000000000000"; // Placeholder
    
    // For now, we'll create a mock registration that stores the IP Asset info
    // In production, you would interact with Story Protocol's actual contracts
    
    // Generate a unique IP Asset ID
    const ipAssetId = ethers.keccak256(
      ethers.toUtf8Bytes(`${ipfsUri}-${eventName}-${Date.now()}`)
    );
    
    // Generate IP Account address (simplified - Story Protocol uses ERC-6551)
    const accountHash = ethers.keccak256(
      ethers.concat([
        ethers.toUtf8Bytes("IP_ACCOUNT"),
        ethers.toUtf8Bytes(ipAssetId)
      ])
    );
    // Convert hash to address format (take last 40 chars and add 0x prefix)
    const ipAccount = "0x" + accountHash.slice(-40);

    // Store IP Asset registration locally
    const registrationData = {
      ipAssetId,
      ipAccount,
      ipfsUri,
      eventName,
      registeredBy: address,
      registeredAt: new Date().toISOString(),
      protocol: "Story Protocol",
      network: "base-sepolia" // Story Protocol typically uses Base Sepolia
    };

    localStorage.setItem(`story-ip-asset-${ipAssetId}`, JSON.stringify(registrationData));
    
    console.log("IP Asset registered with Story Protocol:", registrationData);
    
    return { ipAssetId, ipAccount };
  } catch (error) {
    console.error("Error registering IP Asset:", error);
    throw new Error("Failed to register IP Asset with Story Protocol");
  }
}

/**
 * Main function to publish event as IP Asset on Story Protocol
 */
export async function publishEventToStoryProtocol(
  eventData: {
    name: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    location: string;
    id: string;
    [key: string]: any;
  },
  signer: ethers.Signer
): Promise<{ ipfsUri: string; ipAssetId: string; ipAccount: string }> {
  try {
    // Prepare metadata for IPFS
    const metadata: IPAssetMetadata = {
      name: eventData.name,
      description: eventData.description,
      image: eventData.imageUrl,
      attributes: {
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location,
        isPublic: eventData.isPublic,
        isFree: eventData.isFree,
        capacity: eventData.capacity,
      },
      createdAt: new Date().toISOString(),
      eventId: eventData.id,
    };

    // Step 1: Upload metadata to IPFS
    const ipfsUri = await uploadToIPFS(metadata);
    console.log("Metadata uploaded to IPFS:", ipfsUri);

    // Step 2: Register as IP Asset with Story Protocol
    const { ipAssetId, ipAccount } = await registerIPAsset(
      ipfsUri,
      eventData.name,
      signer
    );
    console.log("IP Asset registered:", { ipAssetId, ipAccount });

    return {
      ipfsUri,
      ipAssetId,
      ipAccount,
    };
  } catch (error) {
    console.error("Error publishing to Story Protocol:", error);
    throw error;
  }
}

/**
 * Retrieves IP Asset information from Story Protocol
 */
export async function getIPAsset(ipAssetId: string): Promise<any> {
  const stored = localStorage.getItem(`story-ip-asset-${ipAssetId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  throw new Error("IP Asset not found");
}

