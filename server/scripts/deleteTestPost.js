const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('MongoDB URI not found in environment variables');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        // Define Project schema (minimal version)
        const projectSchema = new mongoose.Schema({}, { strict: false });
        const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

        // Find and delete the test integration post
        const result = await Project.deleteMany({
            $or: [
                { title: /test integration/i },
                { title: /integration test/i },
                { content: /testing api connection/i }
            ]
        });

        console.log(`✅ Deleted ${result.deletedCount} test post(s)`);

        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        mongoose.connection.close();
        process.exit(1);
    });
