import { NextResponse } from "next/server";
import {
  StoryClient,
  aeneid,
  mainnet,
  PILFlavor,
  WIP_TOKEN_ADDRESS,
} from "@story-protocol/core-sdk";
import { parseEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createHash } from "crypto";
import axios from "axios";

export const runtime = "nodejs";

type NetworkType = "aeneid" | "mainnet";

const networkDefaults: Record<NetworkType, { rpc: string; spg: string }> = {
  aeneid: {
    rpc: "https://aeneid.storyrpc.io",
    spg: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
  },
  mainnet: {
    rpc: "https://mainnet.storyrpc.io",
    spg: "0x98971c660ac20880b60F86Cc3113eBd979eb3aAE",
  },
};

async function uploadJsonToIpfs(payload: unknown, pinataJwt: string) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const res = await axios.post(
    url,
    {
      pinataOptions: { cidVersion: 0 },
      pinataMetadata: { name: "metadata.json" },
      pinataContent: payload,
    },
    {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.IpfsHash as string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ipMetadata, nftMetadata, spgAddress, licenseTermsData } = body ?? {};

    if (!ipMetadata || !nftMetadata) {
      return NextResponse.json(
        { error: "ipMetadata and nftMetadata are required" },
        { status: 400 }
      );
    }

    const pinataJwt = process.env.PINATA_JWT;
    const walletKey = process.env.WALLET_PRIVATE_KEY;
    const network = (process.env.STORY_NETWORK as NetworkType) || "aeneid";
    const rpc =
      process.env.RPC_PROVIDER_URL || networkDefaults[network]?.rpc || networkDefaults.aeneid.rpc;
    const spg =
      spgAddress ||
      process.env.STORY_SPG_NFT_ADDRESS ||
      networkDefaults[network]?.spg ||
      networkDefaults.aeneid.spg;

    if (!pinataJwt) {
      return NextResponse.json({ error: "PINATA_JWT is not set" }, { status: 500 });
    }
    if (!walletKey) {
      return NextResponse.json({ error: "WALLET_PRIVATE_KEY is not set" }, { status: 500 });
    }

    // Upload metadata to IPFS
    const [ipIpfsHash, nftIpfsHash] = await Promise.all([
      uploadJsonToIpfs(ipMetadata, pinataJwt),
      uploadJsonToIpfs(nftMetadata, pinataJwt),
    ]);

    // Compute SHA-256 hashes of the raw metadata payloads
    const ipHash = createHash("sha256").update(JSON.stringify(ipMetadata)).digest("hex");
    const nftHash = createHash("sha256").update(JSON.stringify(nftMetadata)).digest("hex");

    // Build Story client
    const account = privateKeyToAccount(`0x${walletKey}`);
    const storyClient = StoryClient.newClient({
      account,
      transport: http(rpc),
      chainId: network,
    });

    const chain = network === "mainnet" ? mainnet : aeneid;
    const protocolExplorer =
      chain === mainnet
        ? "https://explorer.story.foundation"
        : "https://aeneid.explorer.story.foundation";

    const response = await storyClient.ipAsset.registerIpAsset({
      nft: { type: "mint", spgNftContract: spg },
      licenseTermsData:
        licenseTermsData ||
        [
          {
            terms: PILFlavor.commercialRemix({
              commercialRevShare: 5,
              defaultMintingFee: parseEther("1"),
              currency: WIP_TOKEN_ADDRESS,
            }),
          },
        ],
      ipMetadata: {
        ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
        ipMetadataHash: `0x${ipHash}`,
        nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
        nftMetadataHash: `0x${nftHash}`,
      },
    });

    return NextResponse.json({
      ipId: response.ipId,
      ipAccount: response.ipAccount,
      txHash: response.txHash,
      licenseTermsIds: response.licenseTermsIds,
      ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
      nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
      explorerUrl: `${protocolExplorer}/ipa/${response.ipId}`,
    });
  } catch (error: any) {
    console.error("Register IP error:", error);
    const message = error?.message || "Failed to register IP Asset";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

