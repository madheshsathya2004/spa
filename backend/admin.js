const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const DB_FILE = path.join(__dirname, "..", "data", "db.json");



const id = 1;
const fullName = "Admin"
const email = "admin@gmail.com"
const password = "admin123"
const phone = "9483948394"
const role = "admin"

const initDatabase = async () => {
    try {
        await fs.access(DB_FILE);
    } catch {
        await fs.writeFile(DB_FILE, JSON.stringify({ users: [] }, null, 2));
        console.log('Database file created');
    }
};

async function addAdmin() {

    const hashedPassword = await bcrypt.hash(password, 10);

    //Check Database is available or not.
    initDatabase();

    const data = await fs.readFile(DB_FILE, 'utf8');
    const db = JSON.parse(data);

    const newUser = {
            id,
            fullName,
            email,
            phone: phone || '',
            role,
            password: hashedPassword,
            createdAt: new Date().toISOString()
            };
        
    // Add Admin to database
    db.users.push(newUser);

    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    console.log("Admin Added");

}

addAdmin()
