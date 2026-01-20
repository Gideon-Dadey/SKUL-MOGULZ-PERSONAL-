import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

// Connect to Database then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to database', err);
});
