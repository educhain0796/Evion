import { NextResponse } from "next/server";
import { createHash } from "crypto";
import axios from "axios";

export const runtime = "nodejs";

async function uploadJsonToIpfs(payload: unknown, pinataJwt: string, name: string) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const res = await axios.post(
    url,
    {
      pinataOptions: { cidVersion: 0 },
      pinataMetadata: { name },
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
    const { ipMetadata, nftMetadata, contractMetadata } = body ?? {};

    if (!ipMetadata && !nftMetadata && !contractMetadata) {
      return NextResponse.json(
        { error: "At least one of ipMetadata, nftMetadata, contractMetadata is required" },
        { status: 400 }
      );
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "PINATA_JWT is not set" }, { status: 500 });
    }

    const results: Record<string, any> = {};

    if (ipMetadata) {
      const ipIpfsHash = await uploadJsonToIpfs(ipMetadata, pinataJwt, "ip-metadata.json");
      const ipHash = createHash("sha256").update(JSON.stringify(ipMetadata)).digest("hex");
      results.ipIpfsHash = ipIpfsHash;
      results.ipHash = ipHash;
      results.ipMetadataURI = `https://ipfs.io/ipfs/${ipIpfsHash}`;
    }

    if (nftMetadata) {
      const nftIpfsHash = await uploadJsonToIpfs(nftMetadata, pinataJwt, "nft-metadata.json");
      const nftHash = createHash("sha256").update(JSON.stringify(nftMetadata)).digest("hex");
      results.nftIpfsHash = nftIpfsHash;
      results.nftHash = nftHash;
      results.nftMetadataURI = `https://ipfs.io/ipfs/${nftIpfsHash}`;
    }

    if (contractMetadata) {
      const contractIpfsHash = await uploadJsonToIpfs(
        contractMetadata,
        pinataJwt,
        "contract-metadata.json"
      );
      const contractHash = createHash("sha256")
        .update(JSON.stringify(contractMetadata))
        .digest("hex");
      results.contractIpfsHash = contractIpfsHash;
      results.contractHash = contractHash;
      results.contractMetadataURI = `https://ipfs.io/ipfs/${contractIpfsHash}`;
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Upload metadata error:", error);
    const message = error?.message || "Failed to upload metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

