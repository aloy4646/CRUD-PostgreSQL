const validator = require('validator')

const db = require('./db.js')

const deleteContact = async (name) => {
    try {
        const client = await db.connect()
        const result = await client.query('DELETE FROM contacts WHERE name = $1', [name])
        client.release()

        if (result.rowCount === 0) {
            return -1
        }else{
            return 1
        }
    } catch (error) {
        console.error('Error fetching contacts:', error)
        throw error
    }
}

const validasi = async (newContact, namaBerubah) => {
    pesanError = []

    if(namaBerubah){
        try {
            // Lakukan pengecekan apakah ada kontak lain dengan nama yang sama
            const existingContact = await getContact(newContact.name);
            if (existingContact) {
                pesanError.push("Nama sudah ada dan tidak dapat digunakan");
            }
        } catch (error) {
            // Tangani kesalahan dari pengecekan atau koneksi ke database
            console.error('Error checking for existing contact:', error);
            pesanError.push("Terjadi kesalahan saat memeriksa keberadaan kontak.");
        }
    }

    if(newContact.email && !validator.isEmail(newContact.email)){
        pesanError.push("Format email tidak sesuai")
    }

    if(!validator.isMobilePhone(newContact.mobile, "id-ID")){
        pesanError.push("Format nomor handphone tidak sesuai")
    }

    return pesanError
}

const getContact = async (name) => {
    try {
        const client = await db.connect()
        const result = await client.query('SELECT * FROM contacts WHERE name = $1', [name])
        client.release()
        if (result.rows.length === 0) {
            return null
        }
        return result.rows[0]
    } catch (error) {
        console.error('Error fetching contacts:', error)
        throw error
    }
}

const getContacts = async () => {
    try {
        const client = await db.connect()
        const result = await client.query('SELECT name, mobile FROM contacts')
        client.release()
        return result.rows
    } catch (error) {
        console.error('Error fetching contacts:', error)
        throw error
    }
}

const saveContact = async (newContact) => {
    //untuk mengatasi saat email kosong
    let emailValue = newContact.email || ''

    try {
        const client = await db.connect()
        const result = await client.query('INSERT INTO contacts (name, email, mobile) VALUES ($1, $2, $3)', [newContact.name, emailValue, newContact.mobile])
        client.release()
        return result
    } catch (error) {
        console.error('Error fetching contacts:', error)
        throw error
    }
}

const updateContact = async (oldName, newContact) => {
    //untuk mengatasi saat email kosong
    let emailValue = newContact.email || ''

    try {
        const client = await db.connect()
        const result = await client.query('UPDATE contacts SET name = $1, email = $2, mobile = $3 WHERE name = $4', [newContact.name, emailValue, newContact.mobile, oldName])
        client.release()
        return result
    } catch (error) {
        console.error('Error fetching contacts:', error)
        throw error
    }
}

module.exports = {deleteContact,
                validasi,
                getContact,
                getContacts,
                saveContact,
                updateContact}