import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dataUrl, filename = "image.png" } = body ?? {};

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return NextResponse.json({ error: "dataUrl is required (base64 data URI)" }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json({ error: "PINATA_JWT is not set" }, { status: 500 });
    }

    const [, base64] = dataUrl.split("base64,");
    const buffer = Buffer.from(base64, "base64");

    const form = new FormData();
    form.append("file", buffer, { filename });

    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
        ...form.getHeaders(),
      },
    });

    const ipfsHash = res.data.IpfsHash as string;
    return NextResponse.json({
      ipfsHash,
      uri: `https://ipfs.io/ipfs/${ipfsHash}`,
    });
  } catch (error: any) {
    console.error("Upload image error:", error);
    const message = error?.message || "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

