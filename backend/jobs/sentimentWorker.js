const Post = require('../models/Post');

// Simple sentiment dictionary for MVP (avoiding heavy ML deps)
const dictionary = {
    positive: ['awesome', 'great', 'happy', 'excited', 'love', 'good', 'success', 'win', 'best', 'community'],
    negative: ['bad', 'sad', 'angry', 'hate', 'fail', 'error', 'worst', 'problem', 'issue', 'depressed']
};

exports.processPost = async (postId) => {
    try {
        const post = await Post.findById(postId);
        if (!post) return;

        const text = (post.caption || "") + " " + (post.description || "");
        const tokens = text.toLowerCase().split(/\s+/);

        let score = 0;
        tokens.forEach(token => {
            if (dictionary.positive.includes(token)) score++;
            if (dictionary.negative.includes(token)) score--;
        });

        let label = 'Neutral';
        if (score > 0) label = 'Positive';
        if (score < 0) label = 'Negative';

        post.sentiment = label; // Ensure Schema has this field (strict: false or added)
        // If schema is strict, this might fail to save if field not defined. 
        // We'll assume strict: false or user adds it.
        // For safety, we can just log it if we can't save.

        await post.save();
        // console.log(`Processed sentiment for Post ${postId}: ${label}`);

        return label;
    } catch (err) {
        console.error("Sentiment Worker Error:", err);
    }
};

// In a real BullMQ setup, this would define the Queue and Worker.
// exports.queue = new Queue('sentiment');
// exports.worker = new Worker('sentiment', async job => processPost(job.data.postId));
