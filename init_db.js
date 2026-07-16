const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
    console.log("⚙️ Starting MySQL database initialization...");

    const connectionConfig = {
        host: 'localhost',
        user: 'root',
        password: 'Pujitha@123',
        multipleStatements: true
    };

    try {
        const connection = await mysql.createConnection(connectionConfig);
        console.log("✅ Successfully connected to MySQL server!");

        // Drop database if it exists to start on a clean slate and avoid duplicate keys
        console.log("🗑️ Cleaning up any old 'smart_campus' database...");
        await connection.query("DROP DATABASE IF EXISTS smart_campus;");

        const schemaPath = path.join(__dirname, 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.error(`❌ schema.sql file not found at: ${schemaPath}`);
            return;
        }

        const sqlScript = fs.readFileSync(schemaPath, 'utf8');

        console.log("🚀 Executing database setup script as a single transaction...");
        await connection.query(sqlScript);

        console.log("🎉 MySQL Database 'smart_campus' initialized successfully with all tables and seed data!");
        await connection.end();

    } catch (error) {
        console.error("❌ Failed to initialize database.");
        console.error("   Details:", error.message);
    }
})();
