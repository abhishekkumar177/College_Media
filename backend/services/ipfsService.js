const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('../utils/logger');

// IPFS Node URL (Default to Docker/Localhost)
const IPFS_API_URL = process.env.IPFS_API_URL || 'http://127.0.0.1:5001/api/v0';
// Public Gateway for resolving CIDs
const IPFS_GATEWAY = process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs';

class IPFSService {

    /**
     * Upload file to IPFS Node
     * @param {string} filePath - Absolute path to file
     * @returns {Promise<string>} CID (Content ID)
     */
    static async uploadFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error('File not found');
            }

            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            const response = await axios.post(`${IPFS_API_URL}/add`, formData, {
                headers: {
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });

            // Handle IPFS Daemon response
            // It typically returns JSON: { "Name": "file", "Hash": "Qm...", "Size": "..." }
            const { Hash } = response.data;

            logger.info(`IPFS Upload Success. CID: ${Hash}`);
            return Hash;

        } catch (error) {
            logger.error('IPFS Service Error:', error.message);
            if (error.code === 'ECONNREFUSED') {
                throw new Error('IPFS Node is not reachable. Is the daemon running?');
            }
            throw error;
        }
    }

    /**
     * Get public URL for CID
     */
    static getGatewayUrl(cid) {
        return `${IPFS_GATEWAY}/${cid}`;
    }
}

module.exports = IPFSService;
