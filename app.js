const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const morgan = require('morgan')

const bodyParser = require('body-parser')

//menambahkan module method-override untuk membantu mengubah request saat update dan delete
//request diubah karena html tidak memiliki method put dan delete
const methodOverride = require('method-override')

//fungsi yang berkaitan dengan fs dan validator dipisah ke controller
const controller = require('./controller.js')

const app = express()

// set view engine memakai ejs
app.set('view engine', 'ejs')

// set layout menggunakan express-ejs-layout dan menentukan tempat template.js berada
app.use(expressLayouts)
app.set('layout', 'layout/template.ejs')

app.use(methodOverride('_method'))
app.use(morgan("dev"))

// menggunakan middleware body-parser untuk mengirimkan input dari Form dan dipanggil menggunakan req.body
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))


//index
app.get('/', (req, res) => {
    res.render('index', 
    {
        name:'Jon', 
        title:'NodeJS Web Server'
    })
})

//about
app.get('/about', (req, res) => {
    res.render('about', 
    {
        title: "About",
        imagePath: "images/roma_love.png"
    })
})

//Form
app.post('/contact/form', async (req, res) => {
    //jika edit contact maka akan ada oldName yang dapat diquery
    const oldName = req.query.oldName
    var request = "POST"
    var contact = null

    //jika oldName ada maka akan dilakukan Update
    if(oldName){
        contact = await controller.getContact(oldName)
        request = "PUT"
    }

    //pesan error dipakai untuk menampilkan pop-up error, namun disini akan dikosongkan
    //app.post('/contact/form'... hanya dipanggil saat form pertama kali dipanggil saja
    //jika ada error pada pengisian form nantinya, maka masing-masing route (put dan post) akan merender form.ejs secara langsung
    renderForm(res, oldName, contact, request, [])
})

//Create Contact
app.post('/contact', async (req, res) => {
    const newContact = {"name": req.body.name, "mobile": req.body.mobile, "email": req.body.email}

    //namaBerubah digunakaan saat pengecekan duplikat
    var namaBerubah = true
    var pesanError = await controller.validasi(newContact, namaBerubah)

    if(pesanError.length > 0){
        renderForm(res, null, newContact, "POST", pesanError)
        return
    }

    controller.saveContact(newContact)

    res.render('submit',
    {
        title: "Submit",
        newContact,
        request: "POST"
    })
})

//Read List Contact
app.get('/contact', async (req, res) => {
    const contacts = await controller.getContacts()
    res.render('contact', 
    {
        title: "Contact", 
        contacts
    })
})

//Read Detail Contact
app.get('/contact/:name', async (req, res) => {
    const contact = await controller.getContact(req.params.name)
    console.log(contact)
    res.render('detailContact', 
    {
        title: "Detail Contact",
        contact
    })
})

//Update Contact
app.put('/contact', async (req, res) => {
    const oldContact = await controller.getContact(req.body.oldName)
    const newContact = {"name": req.body.name, "mobile": req.body.mobile, "email": req.body.email}

    //saya membolehkan nama tidak berubah saat update
    var namaBerubah = true
    if(oldContact.name === newContact.name) namaBerubah = false

    //validasi, jika ada error langsung redirect ke error page
    var pesanError = await controller.validasi(newContact, namaBerubah)

    if(pesanError.length > 0){
        renderForm(res, oldContact.name, newContact, "PUT", pesanError)
        return
    }

    controller.updateContact(req.body.oldName, newContact)

    res.render('submit',
    {
        title: "Submit",
        newContact,
        request: "PUT"
    })
})

const renderForm = (res, oldName, contact, request, pesanError) => {
    //mengubah array kedalam bentuk string
    var stringPesanError = ""
    pesanError.forEach(error => {
        console.log(error)
        stringPesanError += error + ", "
    })

    res.render('form',
    {
        title: "Form Contact",
        oldName,
        contact,
        request,
        pesanError: stringPesanError,
    })
}

//Delete Contact
app.delete('/contact/:name', async (req, res) => {
    const rowDeleted = await controller.deleteContact(req.params.name)
    var berhasil = true

    if (rowDeleted === -1) berhasil = false

    res.render('deleteContact', 
    {
        title: "Delete Contact",
        name: req.params.name,
        berhasil
    })
})

app.use('/', (req, res) => {
    res.status(404)
    res.send('page not found : 404')
})

app.listen(3000)