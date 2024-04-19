const { Pool } = require('pg')

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db',
    password: '*****',
    port: 5432,
})

// Handle error koneksi
db.on('error', (err, client) => {
    console.error('Error:', err);
});

module.exports = db