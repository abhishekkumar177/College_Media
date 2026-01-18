const Document = require('../models/Document');

exports.createDocument = async (req, res) => {
    try {
        const doc = await Document.create({
            title: req.body.title || 'Untitled Document',
            owner: req.user.id,
            collaborators: [{ user: req.user.id, role: 'editor' }]
        });
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const docs = await Document.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id }
            ]
        }).sort({ lastModified: -1 });
        res.status(200).json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        // Check access
        const isOwner = doc.owner.toString() === req.user.id;
        const isCollab = doc.collaborators.some(c => c.user.toString() === req.user.id);
        if (!isOwner && !isCollab && !doc.isPublic) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (doc.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await doc.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
