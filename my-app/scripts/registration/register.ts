import { SPGNFTContractAddress } from '../../utils/utils'
import { client, networkInfo } from '../../utils/config'
import { uploadJSONToIPFS } from '../../utils/functions/uploadToIpfs'
import { createHash } from 'crypto'
import { IpMetadata, PILFlavor, WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk'
import { parseEther } from 'viem'

const main = async function () {
    // 1. Set up your IP Metadata
    //
    // Docs: https://docs.story.foundation/concepts/ip-asset/ipa-metadata-standard
    const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: 'Midnight cravings IP METADATA',
        description: 'This is a fucking shakespeare art piece IP METADATA.',
        createdAt: '1740006969',
        creators: [
            {
                name: 'M Paik',
                address: '0x515C2C3BF67ECE4903ae3F019A14191bd2ACcA6c',
                contributionPercent: 100,
            },
        ],
        image: 'ipfs://QmdzJzfRoTg83K1JQ6P84PsWy6QaBdoNERmkG8MU9rRmBE',
        imageHash: '0xc44473f04acbd3f86c1c4bd8a59891af958aa531043b6418077ef146821c472d',
        mediaUrl: 'ipfs://QmdzJzfRoTg83K1JQ6P84PsWy6QaBdoNERmkG8MU9rRmBE',
        // mediaHash: '0xb52a44f53b2485ba772bd4857a443e1fb942cf5dda73c870e2d2238ecd607aee',
        mediaType: 'image/jpeg',
    })

    // 2. Set up your NFT Metadata
    //
    // Docs: https://docs.opensea.io/docs/metadata-standards#metadata-structure
    const nftMetadata = {
        name: 'Midnight Cravings NFT METADATA',
        description: 'This is NFT METADATA.',
        image: 'ipfs://QmdzJzfRoTg83K1JQ6P84PsWy6QaBdoNERmkG8MU9rRmBE',
        animation_url: 'ipfs://QmdzJzfRoTg83K1JQ6P84PsWy6QaBdoNERmkG8MU9rRmBE',
        // attributes: [
        //     {
        //         key: 'Suno Artist',
        //         value: 'amazedneurofunk956',
        //     },
        //     {
        //         key: 'Artist ID',
        //         value: '4123743b-8ba6-4028-a965-75b79a3ad424',
        //     },
        //     {
        //         key: 'Source',
        //         value: 'Suno.com',
        //     },
        // ],
    }

    // 3. Upload your IP and NFT Metadata to IPFS
    const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
    const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
    const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
    const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

    // 4. Register the NFT as an IP Asset
    //
    // Docs: https://docs.story.foundation/sdk-reference/ip-asset#registeripasset
    const response = await client.ipAsset.registerIpAsset({
        nft: { type: 'mint', spgNftContract: SPGNFTContractAddress },
        licenseTermsData: [
            {
                terms: PILFlavor.commercialRemix({
                    commercialRevShare: 5, // 5%
                    defaultMintingFee: parseEther('1'), // 1 $IP
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
    })
    console.log('Root IPA created:', {
        'Transaction Hash': response.txHash,
        'IPA ID': response.ipId,
        'License Terms IDs': response.licenseTermsIds,
    })
    console.log(`View on the explorer: ${networkInfo.protocolExplorer}/ipa/${response.ipId}`)
}

main()
