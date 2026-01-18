const crypto = require('crypto');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

/**
 * Simple Merkle Tree Implementation
 */
class MerkleTree {
    constructor(leaves) {
        this.leaves = leaves.map(leaf => this.hash(leaf));
        this.tree = [];
        this.buildTree();
    }

    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    buildTree() {
        let level = this.leaves;
        this.tree.push(level);
        while (level.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < level.length; i += 2) {
                if (i + 1 < level.length) {
                    nextLevel.push(this.hash(level[i] + level[i + 1]));
                } else {
                    nextLevel.push(level[i]); // Odd number, carry over
                }
            }
            this.tree.push(nextLevel);
            level = nextLevel;
        }
    }

    getRoot() {
        return this.tree[this.tree.length - 1][0];
    }

    getProof(leafIndex) {
        const proof = [];
        let index = leafIndex;
        for (let i = 0; i < this.tree.length - 1; i++) {
            const level = this.tree[i];
            const isRight = index % 2 === 1;
            const siblingIndex = isRight ? index - 1 : index + 1;

            if (siblingIndex < level.length) {
                proof.push({
                    position: isRight ? 'left' : 'right',
                    data: level[siblingIndex]
                });
            }
            index = Math.floor(index / 2);
        }
        return proof;
    }
}

/**
 * Generates a Merkle Proof for a given data object
 * In a real scenario, we would batch issue credentials periodically.
 * Here we simulate it per credential for MVP simplicity.
 */
exports.issueCredential = (credentialData) => {
    // 1. Create a "Batch" of mock transactions + this new one
    const timestamp = Date.now().toString();
    const dataString = JSON.stringify(credentialData) + timestamp;

    // Simulate batch context (e.g., other certs issued in same block)
    const batchData = [
        "genesis-block-anchor",
        dataString,
        "mock-credential-3",
        "mock-credential-4"
    ];

    const tree = new MerkleTree(batchData);
    const root = tree.getRoot();
    const targetHash = tree.hash(dataString);
    const proof = tree.getProof(1); // Index 1 is our data

    return { root, targetHash, proof: proof.map(p => p.data) };
};

exports.verifyProof = (targetHash, proof, root) => {
    // Simplified verification logic assumes specific path structure for MVP
    // A robust verifier recomputes the hash up the tree
    // ... verification logic ...
    return true; // Mock verification for now
};

exports.generatePDF = async (credential, user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Background & Border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

            // Header
            doc.font('Helvetica-Bold').fontSize(30).text('Certificate of Achievement', { align: 'center', mt: 50 });
            doc.moveDown();

            // Body
            doc.font('Helvetica').fontSize(15).text('This is to certify that', { align: 'center' });
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(25).text(user.username, { align: 'center' });
            doc.moveDown();
            doc.font('Helvetica').fontSize(15).text(`has successfully completed`, { align: 'center' });
            doc.moveDown();
            doc.font('Helvetica-Bold').fontSize(20).text(credential.title, { align: 'center' });
            doc.moveDown();

            // Blockchain Info
            doc.moveDown(2);
            doc.fontSize(10).font('Courier').text(`Credential ID: ${credential._id}`, { align: 'center' });
            doc.text(`Merkle Root: ${credential.proof.root.substring(0, 40)}...`, { align: 'center' });

            // QR Code
            const qrUrl = await QRCode.toDataURL(credential.verificationUrl);
            doc.image(qrUrl, doc.page.width / 2 - 50, doc.page.height - 150, { width: 100 });

            doc.fontSize(8).text('Scan to Verify', doc.page.width / 2 - 50, doc.page.height - 40, { width: 100, align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
