import { NFTStorage, File } from 'nft.storage'

export const nftStorageClient = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE_TOKEN })