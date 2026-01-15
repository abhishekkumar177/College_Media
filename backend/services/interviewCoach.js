const ffmpeg = require('fluent-ffmpeg');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const InterviewSession = require('../models/InterviewSession');
const logger = require('../utils/logger');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class InterviewCoachService {

    /**
     * Process a video interview
     * @param {string} sessionId 
     * @param {string} videoPath 
     */
    static async processInterview(sessionId, videoPath) {
        try {
            const audioPath = videoPath.replace('.mp4', '.mp3');

            // 1. Extract Audio
            await this.extractAudio(videoPath, audioPath);

            // 2. Transcribe
            const transcript = await this.transcribeAudio(audioPath);

            // 3. Analyze Content (GPT-4)
            const analysis = await this.analyzeResponse(transcript);

            // 4. Update Database
            await InterviewSession.findByIdAndUpdate(sessionId, {
                transcript,
                analysis,
                status: 'completed'
            });

            // Cleanup
            fs.unlinkSync(audioPath);
            // Optionally keep video or move to S3

            logger.info(`Interview processed for session ${sessionId}`);
        } catch (error) {
            logger.error(`Interview processing failed for ${sessionId}:`, error);
            await InterviewSession.findByIdAndUpdate(sessionId, { status: 'failed' });
        }
    }

    static extractAudio(input, output) {
        return new Promise((resolve, reject) => {
            ffmpeg(input)
                .toFormat('mp3')
                .on('end', resolve)
                .on('error', reject)
                .save(output);
        });
    }

    static async transcribeAudio(filePath) {
        // Fallback if no API key
        if (!process.env.OPENAI_API_KEY) return "Mock transcript of the interview answer.";

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
        });
        return response.text;
    }

    static async analyzeResponse(text) {
        if (!process.env.OPENAI_API_KEY) {
            return {
                confidenceScore: 85,
                sentiment: 'Positive',
                pace: 'Good',
                feedback: 'Great answer! You covered the key points clearly.',
                emotions: { happy: 0.2, nervous: 0.1, neutral: 0.7 }
            };
        }

        const prompt = `Analyze this interview answer: "${text}". 
        Provide a JSON response with:
        - confidenceScore (0-100)
        - sentiment (Positive/Neutral/Negative)
        - pace (Too Fast/Good/Too Slow)
        - feedback (2 sentences)
        - emotions (estimated happy, nervous, neutral ratios sum to 1)`;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4",
        });

        const raw = completion.choices[0].message.content;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return { // Fallback if JSON parse fails
                confidenceScore: 70,
                sentiment: 'Neutral',
                pace: 'Good',
                feedback: raw.substring(0, 100) + '...',
                emotions: { neutral: 1.0 }
            };
        }
    }
}

module.exports = InterviewCoachService;
