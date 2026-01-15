const NodeMediaServer = require('node-media-server');
const LiveStream = require('../models/LiveStream');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Ensure media directory exists
const mediaPath = path.join(__dirname, '../media');
if (!fs.existsSync(mediaPath)) {
    fs.mkdirSync(mediaPath, { recursive: true });
}

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        mediaroot: mediaPath,
        allow_origin: '*'
    },
    trans: {
        ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg',
        tasks: [
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                dash: true,
                dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
            }
        ]
    }
};

class LiveStreamService {
    constructor() {
        this.nms = new NodeMediaServer(config);
    }

    start() {
        this.nms.run();

        // Event Hooks
        this.nms.on('prePublish', async (id, StreamPath, args) => {
            logger.info('[NodeMediaServer] prePublish:', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

            // Validate Stream Key (StreamPath usually is /live/STREAM_KEY)
            const streamKey = StreamPath.split('/')[2];

            try {
                const stream = await LiveStream.findOne({ streamKey, status: 'pending' });
                if (!stream) {
                    logger.warn(`[NodeMediaServer] Unauthorized publish attempt: ${streamKey}`);
                    const session = this.nms.getSession(id);
                    session.reject();
                    return;
                }

                // Update stream status
                stream.status = 'live';
                stream.startedAt = new Date();
                stream.playbackUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;
                await stream.save();

                logger.info(`[NodeMediaServer] Stream started: ${streamKey}`);
            } catch (error) {
                logger.error('[NodeMediaServer] prePublish error:', error);
            }
        });

        this.nms.on('donePublish', async (id, StreamPath, args) => {
            logger.info('[NodeMediaServer] donePublish:', `id=${id} StreamPath=${StreamPath}`);

            const streamKey = StreamPath.split('/')[2];
            try {
                await LiveStream.findOneAndUpdate(
                    { streamKey },
                    {
                        status: 'ended',
                        endedAt: new Date(),
                        isArchived: true
                    }
                );
                logger.info(`[NodeMediaServer] Stream ended: ${streamKey}`);
            } catch (error) {
                logger.error('[NodeMediaServer] donePublish error:', error);
            }
        });
    }

    /**
     * Generate a new Stream Key
     */
    generateStreamKey() {
        return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
}

module.exports = new LiveStreamService();
