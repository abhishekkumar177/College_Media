const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Configuration (In production, use environment variables)
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY';
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CERTIFICATE_CONTRACT_ADDRESS || '';

// Contract ABI (Simplified - include full ABI from compilation in production)
const CONTRACT_ABI = [
    "function mintCertificate(address recipient, string certificateType, string tokenURI) public returns (uint256)",
    "function hasCertificateType(address user, string _type) public view returns (bool)",
    "function getTokensOfOwner(address owner) public view returns (uint256[])",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function certificateType(uint256 tokenId) public view returns (string)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)",
    "event CertificateMinted(uint256 indexed tokenId, address indexed recipient, string certificateType, string tokenURI)"
];

class Web3Service {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.initialized = false;
    }

    /**
     * Initialize the Web3 connection
     */
    async init() {
        if (this.initialized) return;

        try {
            if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
                logger.warn('Web3Service: Missing configuration. Running in mock mode.');
                return;
            }

            this.provider = new ethers.JsonRpcProvider(RPC_URL);
            this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.wallet);
            this.initialized = true;

            logger.info('Web3Service initialized successfully');
        } catch (error) {
            logger.error('Web3Service initialization failed:', error);
        }
    }

    /**
     * Mint a new certificate NFT
     * @param {string} recipientAddress - Wallet address of the recipient
     * @param {string} certificateType - Type (EVENT_ATTENDANCE, COURSE_COMPLETION, BADGE)
     * @param {object} metadata - Certificate metadata for IPFS
     */
    async mintCertificate(recipientAddress, certificateType, metadata) {
        try {
            await this.init();

            if (!this.initialized) {
                // Mock mode for development
                logger.info(`[MOCK] Minting ${certificateType} to ${recipientAddress}`);
                return {
                    success: true,
                    mock: true,
                    tokenId: Math.floor(Math.random() * 10000),
                    txHash: '0x' + 'mock'.repeat(16)
                };
            }

            // In production: Upload metadata to IPFS first
            // const tokenURI = await this.uploadToIPFS(metadata);
            const tokenURI = `ipfs://QmMockHash/${Date.now()}`; // Placeholder

            const tx = await this.contract.mintCertificate(
                recipientAddress,
                certificateType,
                tokenURI
            );

            logger.info(`Minting certificate... TX: ${tx.hash}`);
            const receipt = await tx.wait();

            // Parse event to get token ID
            const event = receipt.logs.find(log => {
                try {
                    return this.contract.interface.parseLog(log)?.name === 'CertificateMinted';
                } catch { return false; }
            });

            const tokenId = event ? this.contract.interface.parseLog(event).args.tokenId : null;

            return {
                success: true,
                tokenId: tokenId?.toString(),
                txHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            logger.error('Mint certificate failed:', error);
            throw error;
        }
    }

    /**
     * Verify if user has a specific certificate type
     */
    async verifyCertificate(walletAddress, certificateType) {
        try {
            await this.init();

            if (!this.initialized) {
                return { verified: false, mock: true };
            }

            const hasCert = await this.contract.hasCertificateType(walletAddress, certificateType);
            return { verified: hasCert };
        } catch (error) {
            logger.error('Verify certificate failed:', error);
            return { verified: false, error: error.message };
        }
    }

    /**
     * Get all certificates for a user
     */
    async getUserCertificates(walletAddress) {
        try {
            await this.init();

            if (!this.initialized) {
                return { certificates: [], mock: true };
            }

            const tokenIds = await this.contract.getTokensOfOwner(walletAddress);
            const certificates = [];

            for (const tokenId of tokenIds) {
                const uri = await this.contract.tokenURI(tokenId);
                const type = await this.contract.certificateType(tokenId);
                certificates.push({
                    tokenId: tokenId.toString(),
                    type,
                    tokenURI: uri
                });
            }

            return { certificates };
        } catch (error) {
            logger.error('Get certificates failed:', error);
            return { certificates: [], error: error.message };
        }
    }
}

module.exports = new Web3Service();
