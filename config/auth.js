const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//Model de usuário
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')




module.exports = function(passport){

    passport.use(new localStrategy({usernameField: 'email'}), (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if(!usuario){
                return done(null, false, {message: 'Este usuário já existe'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return(null, user)
                }
                else {
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        })
    })

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, user)
        })
    })

}