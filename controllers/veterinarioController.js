import Veterinario from "../models/Veterinario.js"
import generarJWT from "../helpers/generarJWT.js"
import generarID from "../helpers/generarID.js"
import emailRegistro from "../helpers/emailRegistro.js"
import emailOlvidePassword from "../helpers/emailOlvidePassword.js"

//END POINTS !!!!!!!!!!!!!!!!!!!!

const registrar = async (req, res) => {
   
    //POST/recibiendo valores enviados desde front por eso es req.body xq que es lo que le envio
    const {nombre, email} = req.body

    //prevenir usuarios duplicados
    const exiteUsuario = await Veterinario.findOne({ email }) // email : email sin iguales se deja el mismo nombre

    if(exiteUsuario){
        const error = new Error('Usuario ya Existe')
        return res.status(400).json({msg : error.message})
    }

    try {
        //guardar un veterinario
        const veterinario = new Veterinario(req.body)
        const veterinarioGuardado = await veterinario.save()

        //enviar email
        emailRegistro({
            nombre,
            email,
            token : veterinarioGuardado.token,
        }) 

        res.json(res.json(veterinarioGuardado))        
    } catch (error) {
        console.log(error)
    }    
}


const confirmar = async (req, res) => {
    const { token } = req.params   
    const usuarioConfirmar = await Veterinario.findOne({ token })
    
    if(!usuarioConfirmar){
        const error = new Error('Token no Valido')
        return res.status(404).json({ msg : error.message})
    }

    try {
        usuarioConfirmar.token = null
        usuarioConfirmar.confirmado = true
        await usuarioConfirmar.save()
       
        res.json({msg : "Usuario confirmado!"})

    } catch (error) {
        console.log(error)
    }
}


const perfil = (req, res) => {
    const {veterinario} = req
    res.json(veterinario)
}


const autenticar = async (req, res) => {
    const {email, password} = req.body

    //comprobar si existe usuario
    const usuario = await Veterinario.findOne({ email })

    if(!usuario){
        const error = new Error('Usuario no existe')
        return res.status(404).json({ msg : error.message})       
    } 

    //comprobar si esta confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({ msg : error.message })
    }
   
    //revisar el pass
    if(await usuario.comprobarPassword(password)){
        // Autenticar
        
        res.json({
            _id : usuario._id,
            nombre : usuario.nombre,
            email : usuario.email,
            token : generarJWT(usuario.id)
        })


    }else{
        const error = new Error('Password Incorrecto')
        return res.status(404).json({ msg : error.message})     
    }   
}


const olvidePassword = async (req, res) =>{
    const {email} = req.body

    const existeVeterinario = await Veterinario.findOne({email})

    if(!existeVeterinario){
        const error = new Error("El usuario no existe")
        return res.status(400).json({msg : error.message})
    }

    try {
        existeVeterinario.token = generarID()
        await existeVeterinario.save()        
        emailOlvidePassword({
            email,
            nombre : existeVeterinario.nombre,
            token : existeVeterinario.token
        })
        res.json({msg : "Hemos enviado un mail con las intrucciones"})
        
    } catch (error) {
        console.log(error)
    }    
}


const comprobarToken = async (req, res) =>{
    const token = req.params.token

    const tokenValido = await Veterinario.findOne({token})

    if(tokenValido){
        //token valido el usuario existe
        res.json({msg :"Token Valido"})
    }else{
        const error =  new Error("token no valido")
        return res.status(400).json({msg : error.message})
    }
}


const nuevoPassword = async (req, res) =>{

    const {token} = req.params // URL
    const {password} = req.body //LO que viene desde un formulario

    const veterinario = await Veterinario.findOne({token})

    if (!veterinario){
        const error = new Error("Hubo un error")
        return res.status(400).json({ msg : error.message})
    }

    try {
        veterinario.token = null
        veterinario.password = password
        await veterinario.save()
        res.json({msg : "Password Modificado!"})

    } catch (error) {
        console.log(error)
    }
}


const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id)

    if(!veterinario){
        const error = new Error('Hubo un error')
        return res.status(400).json({msg : error.message})        
    }

    const { email } = req.body

    if(veterinario.email !== req.body.email){
        const existeEmail = await Veterinario.findOne({email})
        if(existeEmail){
            const error = new Error('Este email ya esta en uso')
            return res.status(400).json({msg : error.message})  
        }
    }

    try {        
        veterinario.nombre = req.body.nombre
        veterinario.enail = req.body.email
        veterinario.web = req.body.web 
        veterinario.telefono = req.body.telefono

        const veterinarioActualizado = await veterinario.save()

        res.json(veterinarioActualizado)

    } catch (error) {
        console.log(error)
    }
}


const actualizarPassword = async (req, res) => {
   //leer datos
   const {id} = req.veterinario
   const {passwordActual, passwordNuevo1} = req.body

   //comproabr que veterinario exista
   const veterinario = await Veterinario.findById(id)

   if(!veterinario){
       const error = new Error('Hubo un error')
       return res.status(400).json({msg : error.message})        
   }

   //comprobar password
   if(await veterinario.comprobarPassword(passwordActual)){
        veterinario.password = passwordNuevo1

        await veterinario.save()
        res.json({msg: 'Password almacenado correctamente'})

   }else{
    const error = new Error('Password actual es incorrecto')
    return res.status(400).json({msg : error.message})     
   }

   //almacenar nuevo password

   
    
}


export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}