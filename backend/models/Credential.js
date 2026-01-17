const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuer: {
        type: String,
        default: 'College Media'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    issueDate: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Course Completion', 'Hackathon', 'Workshop', 'Achievement'],
        default: 'Achievement'
    },
    // The specific data hashed into the Merkle Tree
    metadata: {
        score: String,
        grade: String,
        evidenceUrl: String
    },
    // Blockchain / Merkle Proof Data
    proof: {
        root: String,       // The Merkle Root at time of issuance
        path: [String],     // The proof path (hashes)
        targetHash: String  // The hash of this specific credential
    },
    verificationUrl: String,
    status: {
        type: String,
        enum: ['Valid', 'Revoked'],
        default: 'Valid'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Credential', credentialSchema);
