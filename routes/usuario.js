const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')


router.get('/registro', (req, res) => {
    res.render('usuario/registro.handlebars')
})

router.post('/registro', (req, res) => {
    var erros = []
    if(!req.body.nome || typeof req.body.nome == null || req.body.nome == undefined){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.email == null || req.body.email == undefined){
        erros.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.senha == null || req.body.senha == undefined){
        erros.push({texto: 'Senha inválida'})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'A senha é muito curta'})
    }

    if(req.body.senha2 != req.body.senha){
        erros.push({texto: 'As senhas são diferentes, tente novamente'})
    }

    if(erros.length > 0){
        res.render('usuario/registro.handlebars', {erros: erros})
    }
    else {
        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Já existe uma conta com esse email no nosso sistema')
                res.redirect('/registro')
            }
            else {
                var salt = bcrypt.genSaltSync(10)
                var hash = bcrypt.hashSync(req.body.senha, salt)

                const UserData = {
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: hash
                }

                new Usuario(UserData).save().then(() => {
                    req.flash('success_msg', 'Usuário cadastrado com sucesso')
                    res.redirect('/')
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um error ao tentar salvar o usuario')
                    res.redirect('/usuarios/registro')
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um error interno!')
            res.redirect('/')
        })
    }


})


module.exports = router



