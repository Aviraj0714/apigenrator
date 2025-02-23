const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const generateExpressAPI = (routes, middleware, database, databaseName, mongoURI) => {
    let code = `const express = require('express');\nconst app = express();\napp.use(express.json());\n`;

    // Middleware configurations
    if (middleware.cors) code += `const cors = require('cors');\napp.use(cors());\n`;
    if (middleware.auth) {
        code += `const jwt = require('jsonwebtoken');\n`;
        code += `const authMiddleware = (req, res, next) => { /* JWT Logic */ next(); };\n`;
    }
    if (middleware.rateLimit) {
        code += `const rateLimit = require('express-rate-limit');\n`;
        code += `app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));\n`;
    }

    // Database configurations
    if (database === 'mongodb') {
        code += `const mongoose = require('mongoose');\n`;
        const dbURI = mongoURI || `mongodb://localhost:27017/${databaseName || 'testDB'}`;
        code += `mongoose.connect('${dbURI}', { useNewUrlParser: true, useUnifiedTopology: true })\n`;
        code += `.then(() => console.log('MongoDB Connected'))\n`;
        code += `.catch(err => console.error('MongoDB Connection Error:', err));\n`;
    }

    if (database === 'postgresql') {
        code += `const { Client } = require('pg');\n`;
        code += `const client = new Client({ database: '${databaseName || 'testDB'}' });\n`;
        code += `client.connect()\n`;
        code += `.then(() => console.log('PostgreSQL Connected'))\n`;
        code += `.catch(err => console.error('PostgreSQL Connection Error:', err));\n`;
    }

    // Generating routes dynamically
    routes.forEach(route => {
        try {
            let parsedResponse = JSON.stringify(JSON.parse(route.response), null, 2);
            code += `app.${route.method}('${route.path}', (req, res) => res.json(${parsedResponse}));\n`;
        } catch (error) {
            code += `app.${route.method}('${route.path}', (req, res) => res.json({ error: "Invalid JSON Response" }));\n`;
        }
    });

    // Start the server
    code += `app.listen(3000, () => console.log('Server running on port 3000'));\n`;

    return code;
};

app.post('/generate-api', (req, res) => {
    try {
        const { routes, language, middleware, database, databaseName, mongoURI } = req.body;
        let generatedCode = '';

        if (language === 'express') {
            generatedCode = generateExpressAPI(routes, middleware, database, databaseName, mongoURI);
        }

        // Save generated API file
        const filePath = path.join(__dirname, 'generated', 'api.js');
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, generatedCode);

        res.json({ code: generatedCode });
    } catch (error) {
        console.error('Error generating API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`API Generator running on port ${PORT}`));
