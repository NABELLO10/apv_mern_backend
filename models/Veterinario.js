import mongoose from "mongoose";
import bcrypt from "bcrypt"
import generarID from '../helpers/generarID.js'

const veterinarioShema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim : true
    },
    password: {
        type : String,
        required: true
    },
    email: {
        type : String,
        required: true,
        trim: true,
        unique: true,
    },
    telefono : {
        type : String,
        default: null,
        trim: true,
    },
    web : {
        type: String,
        default : null,
    },
    token: {
        type: String,
        default: generarID(),
    },
    confirmado : {
        type: Boolean,
        default: false
    }
})

veterinarioShema.pre('save', async function(next) {

    //para que un paswrod hasheado no se vuelva a hashear
    if(!this.isModified("password")){
        next() //pasa al siguiente middelware e ignaora este paso
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

//metodos que solo se ejcutan en este codigo
veterinarioShema.methods.comprobarPassword = async function(passwordFormulario){
    return await bcrypt.compare(passwordFormulario, this.password )
}

const Veterinario = mongoose.model("Veterinario", veterinarioShema)

export default Veterinario


