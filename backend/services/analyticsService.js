const Post = require('../models/Post');
const User = require('../models/User');

exports.getDashboardMetrics = async () => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // 1. Daily Active Users (Proxy: Users who posted or commented today)
        // For accurate DAU, we'd need a login tracking table. Here we use content creators as a proxy.
        // Or updated "lastActive" field if we had one. Simple count of users created? No.
        // Let's assume we want total users and new users today.

        const totalUsers = await User.countDocuments();
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });

        // 2. Post Velocity (Last 24h)
        const postsToday = await Post.countDocuments({ createdAt: { $gte: startOfDay } });

        // 3. Hashtag Trends
        // Aggregate all hashtags from posts created in last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const hashtagTrends = await Post.aggregate([
            { $match: { createdAt: { $gte: lastWeek } } },
            { $unwind: "$hashtags" }, // Assuming Post model has tags/hashtags array, or extract from caption
            { $group: { _id: "$hashtags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Note: If 'hashtags' field doesn't exist, we might need to extract regex from captions.
        // Assuming 'tags' field based on standard patterns or just mocking if schema differs.

        // 4. Sentiment Overview (Mocked Aggregation if 'sentiment' field exists)
        // If we don't store sentiment, we can't aggregate it.
        // We will assume the Sentiment Worker populates a 'sentiment' field (Positive, Negative, Neutral).
        const sentimentStats = await Post.aggregate([
            { $match: { createdAt: { $gte: lastWeek }, sentiment: { $exists: true } } },
            { $group: { _id: "$sentiment", count: { $sum: 1 } } }
        ]);

        return {
            users: { total: totalUsers, newToday: newUsersToday },
            posts: { today: postsToday },
            hashtags: hashtagTrends,
            sentiment: sentimentStats
        };
    } catch (error) {
        throw error;
    }
};

exports.getHourlyActivity = async () => {
    // Return activity volume per hour for the heatmaps
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activity = await Post.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        {
            $project: {
                hour: { $hour: "$createdAt" },
                sentiment: 1
            }
        },
        {
            $group: {
                _id: "$hour",
                count: { $sum: 1 },
                positive: { $sum: { $cond: [{ $eq: ["$sentiment", "Positive"] }, 1, 0] } },
                negative: { $sum: { $cond: [{ $eq: ["$sentiment", "Negative"] }, 1, 0] } }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return activity;
};
