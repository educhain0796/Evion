import { NextResponse } from "next/server";
import { StoryClient, aeneid, mainnet } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zeroAddress } from "viem";

export const runtime = "nodejs";

type NetworkType = "aeneid" | "mainnet";

const networkDefaults: Record<NetworkType, { rpc: string }> = {
  aeneid: { rpc: "https://aeneid.storyrpc.io" },
  mainnet: { rpc: "https://mainnet.storyrpc.io" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, symbol, contractURI, isPublicMinting = true, mintOpen = true } = body ?? {};

    if (!name || !symbol) {
      return NextResponse.json({ error: "name and symbol are required" }, { status: 400 });
    }

    const walletKey = process.env.WALLET_PRIVATE_KEY;
    const network = (process.env.STORY_NETWORK as NetworkType) || "aeneid";
    const rpc =
      process.env.RPC_PROVIDER_URL || networkDefaults[network]?.rpc || networkDefaults.aeneid.rpc;

    if (!walletKey) {
      return NextResponse.json({ error: "WALLET_PRIVATE_KEY is not set" }, { status: 500 });
    }

    const account = privateKeyToAccount(`0x${walletKey}`);
    const storyClient = StoryClient.newClient({
      account,
      transport: http(rpc),
      chainId: network,
    });

    const resp = await storyClient.nftClient.createNFTCollection({
      name,
      symbol,
      isPublicMinting,
      mintOpen,
      mintFeeRecipient: zeroAddress,
      contractURI: contractURI || "",
    });

    return NextResponse.json({
      spgNftContract: resp.spgNftContract,
      txHash: resp.txHash,
    });
  } catch (error: any) {
    console.error("Create SPG error:", error);
    const message = error?.message || "Failed to create SPG collection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

