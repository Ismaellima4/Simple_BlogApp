const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')



router.get('/', (req, res) => {
    res.render('admin/index.handlebars')
})

router.get('/posts', (req, res)  => {
    res.send('Página de posts')
})


router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias.handlebars', {categorias: categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias.handlebars')
})

router.post('/categorias/nova', (req, res) => {
    var errors = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errors.push({texto: 'Nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        errors.push({texto: 'Nome da categoria é muito pequeno'})
    }

    if(errors.length > 0){
        res.render('admin/addcategorias.handlebars', {errors: errors})
    }

    else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um error ao salvar a categoria, tente novamente')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias.handlebars', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Essa categoria não existe')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', (req, res) => {
    var errors = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        errors.push({texto: 'Nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        errors.push({texto: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        errors.push({texto: 'Nome da categoria é muito pequeno'})
    }

    if(errors.length > 0){
        res.render('admin/editcategorias.handlebars', {errors: errors})
    }
    else 
        
        Categoria.findOne({_id: req.body.id}).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Error ao salvar categoria')
                res.redirect('admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um error ao editar a categoria')
            res.redirect('/admin/categorias')
        }
)})

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error ao tentar deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req, res) => {
    Postagem.find().populate('categoria').lean().sort({date: 'desc'}).then((postagens) => {
        res.render('admin/postagens.handlebars', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error a tentar carregar as postagens')
        res.redirect('/admin')
    })
})
    
router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem.handlebars', {categorias: categorias})
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um error ao carregar as categorias')
        res.redirect('/admin/')
    })
})

router.post('/postagens/nova', (req, res) => {
    var erros = []
    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria'})
    }
    if(erros.length > 0){
        res.render('admin/addpostagem.handlebars',  {erros: erros})
    }
    else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um error ao tentar salvar a postagem!')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.findOne().then((categorias) => {
            res.render('admin/editpostagens.handlebars', {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um error ao listar as categorias')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => { 
        req.flash('error_msg', 'Houve um error ao tentar carregar o formulário de edição de postagens')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um error ao tentar salvar a postagem!')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('erro_msg', 'Houve um error ao salvara edição')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/deletar', (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um error ao tentar deletar a postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router