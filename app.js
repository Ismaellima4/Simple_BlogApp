const bodyParser = require('body-parser')
const express = require('express')
const handlebars = require('express-handlebars')
const mongoose = require('mongoose')
const path =  require('path')
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
require('dotenv').config()
require('./models/Postagem')
require('./models/Categoria')
require('./config/auth')(passport)
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const app = express()

//config
    //session
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    //flash
    app.use(flash())

    //middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        next()
    })

    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //HandleBars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('views engine', 'handlebars')
    app.set('views', './views')

    //Mongoose
    const dbPassword = process.env.DB_PASS
    const dbUser = process.env.DB_USER
    mongoose.Promise = global.Promise
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.atsoi6s.mongodb.net/?retryWrites=true&w=majority`).then(() => {
        console.log('Connected with database')
    }).catch((error) => console.error(error))

    //public
    app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.get('/', (req, res) => {
   Postagem.find().populate('categoria').lean().sort({date: 'desc'}).then((postagens) => {
        res.render('index.handlebars', {postagens: postagens})
   }).catch((err) => {
        req.flash('error_msg', 'Houve um error ao tentar listar as postagens')
        res.redirect('/404')
   })
})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if(postagem){
            res.render('postagem/index.handlebars', {postagem: postagem})
        }
        else{
            req.flash('error_msg', 'Esta postagem não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error interno')
        res.redirect('/')
    })
})


app.get('/404', (req, res) => {
    res.send('ERROR 404')
})

app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index.handlebars', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error ao tentar listar as categorias')
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('categorias/postagens.handlebars', {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um error ao listar os posts')
                res.redirect('/')
            })
        }
        else {
            req.flash('error_msg', 'Esta categoria não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', ' Houve um error interno ao carregar a página desta categoria')
        res.redirect('/')
    })
})

app.get('/login', (req, res) => {
    res.render('usuario/login.handlebars')
})


app.use('/admin', admin)
app.use('/usuarios', usuarios)


const PORT = process.env.PORT || 8081

app.listen(PORT, () => {
    console.log('Server running in door 8081')
})