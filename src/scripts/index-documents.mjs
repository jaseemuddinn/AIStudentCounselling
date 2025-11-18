/**
 * Script to generate embeddings for existing conversations, messages, and mood logs
 * Run with: node src/scripts/index-documents.mjs
 * 
 * Note: Uses .mjs extension to work with ES modules
 */

import mongoose from 'mongoose';
import embeddingServicePkg from '../lib/ai/embedding-service.js';
import connectDB from '../lib/db/mongodb.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import MoodLog from '../models/MoodLog.js';

const { getEmbeddingService } = embeddingServicePkg;
const embeddingService = getEmbeddingService();

/**
 * Index all conversations (generate summaries and embeddings)
 */
async function indexConversations() {
    console.log('\n📚 Indexing Conversations...');

    // Find conversations without embeddings
    const conversations = await Conversation.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: null },
            { summary: { $exists: false } },
            { summary: '' }
        ]
    }).limit(100); // Process in batches

    console.log(`Found ${conversations.length} conversations to index`);

    let indexed = 0;
    let errors = 0;

    for (const conversation of conversations) {
        try {
            // Get messages for this conversation
            const messages = await Message.find({ conversationId: conversation._id })
                .sort({ createdAt: 1 })
                .lean();

            if (messages.length === 0) {
                console.log(`⚠️  Skipping empty conversation: ${conversation._id}`);
                continue;
            }

            // Generate summary
            const conversationText = embeddingService.formatConversationForEmbedding(messages);
            const summary = conversationText.length > 200
                ? conversationText.substring(0, 200) + '...'
                : conversationText;

            // Generate embedding
            const embedding = await embeddingService.generateEmbedding(conversationText);

            // Update conversation
            conversation.summary = summary;
            conversation.embedding = embedding;
            await conversation.save();

            indexed++;
            console.log(`✅ Indexed conversation ${indexed}/${conversations.length}: ${conversation._id}`);

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            errors++;
            console.error(`❌ Error indexing conversation ${conversation._id}:`, error.message);
        }
    }

    console.log(`\n✅ Conversations indexed: ${indexed}`);
    console.log(`❌ Errors: ${errors}`);

    return { indexed, errors };
}

/**
 * Index all messages (generate embeddings)
 */
async function indexMessages() {
    console.log('\n💬 Indexing Messages...');

    // Find messages without embeddings
    const messages = await Message.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: null }
        ]
    }).limit(500); // Process in batches

    console.log(`Found ${messages.length} messages to index`);

    let indexed = 0;
    let errors = 0;

    // Process in batches for efficiency
    const batchSize = 10;

    for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);

        try {
            // Generate embeddings for batch
            const texts = batch.map(msg => msg.content);
            const embeddings = await embeddingService.generateEmbeddings(texts);

            // Update messages
            for (let j = 0; j < batch.length; j++) {
                batch[j].embedding = embeddings[j];
                await batch[j].save();
                indexed++;
            }

            console.log(`✅ Indexed messages ${indexed}/${messages.length}`);

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            errors += batch.length;
            console.error(`❌ Error indexing message batch:`, error.message);
        }
    }

    console.log(`\n✅ Messages indexed: ${indexed}`);
    console.log(`❌ Errors: ${errors}`);

    return { indexed, errors };
}

/**
 * Index all mood logs (generate embeddings)
 */
async function indexMoodLogs() {
    console.log('\n😊 Indexing Mood Logs...');

    // Find mood logs without embeddings
    const moodLogs = await MoodLog.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: null }
        ]
    }).limit(500); // Process in batches

    console.log(`Found ${moodLogs.length} mood logs to index`);

    let indexed = 0;
    let errors = 0;

    // Process in batches
    const batchSize = 10;

    for (let i = 0; i < moodLogs.length; i += batchSize) {
        const batch = moodLogs.slice(i, i + batchSize);

        try {
            // Generate embeddings for batch
            const texts = batch.map(log => embeddingService.formatMoodLogForEmbedding(log));
            const embeddings = await embeddingService.generateEmbeddings(texts);

            // Update mood logs
            for (let j = 0; j < batch.length; j++) {
                batch[j].embedding = embeddings[j];
                await batch[j].save();
                indexed++;
            }

            console.log(`✅ Indexed mood logs ${indexed}/${moodLogs.length}`);

            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            errors += batch.length;
            console.error(`❌ Error indexing mood log batch:`, error.message);
        }
    }

    console.log(`\n✅ Mood logs indexed: ${indexed}`);
    console.log(`❌ Errors: ${errors}`);

    return { indexed, errors };
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting RAG Indexing Process...\n');
    console.log('⚠️  This will generate embeddings for all existing documents');
    console.log('⚠️  Cost estimate: ~$0.02 per 1M tokens (very cheap)\n');

    try {
        // Connect to database
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Index all document types
        const conversationStats = await indexConversations();
        const messageStats = await indexMessages();
        const moodLogStats = await indexMoodLogs();

        // Print summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 INDEXING SUMMARY');
        console.log('='.repeat(50));
        console.log(`Conversations: ${conversationStats.indexed} indexed, ${conversationStats.errors} errors`);
        console.log(`Messages: ${messageStats.indexed} indexed, ${messageStats.errors} errors`);
        console.log(`Mood Logs: ${moodLogStats.indexed} indexed, ${moodLogStats.errors} errors`);
        console.log('\nTotal Indexed:', conversationStats.indexed + messageStats.indexed + moodLogStats.indexed);
        console.log('Total Errors:', conversationStats.errors + messageStats.errors + moodLogStats.errors);
        console.log('='.repeat(50));

        console.log('\n✅ RAG Indexing Complete!');
        console.log('💡 Tip: Run this script periodically to index new documents');

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the script
main();
