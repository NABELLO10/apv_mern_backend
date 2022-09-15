import express from "express"
import dotenv from 'dotenv'
import cors from "cors"
import conectarDB from './config/db.js'
import veterinarioROUTES from './routes/veterinarioROUTES.js'
import pacienteROUTES from './routes/pacienteROUTES.js'


//aqui se crea la aplicacion de express
const app = express()

//le decimos que enviaremos datos de tipo json
app.use(express.json())

//busca y agrega el archivo .env
dotenv.config()

//conectado a base de datos
conectarDB()

//utilizando cors para proteger la api
const dominiosPermitidos = [process.env.FRONTEND_URL]

const corsOptions = {
    origin : function(origin, callback) {
        if (dominiosPermitidos.indexOf(origin) !== -1){
            //Origen esta permitido
            callback(null, true)
        }else{
            callback(new Error('No permitido por Cors'))            
        }
    }
}

app.use(cors(corsOptions))

//ir a routes
app.use('/api/veterinarios', veterinarioROUTES)
app.use('/api/pacientes', pacienteROUTES)


//definiendo el puerto
const port = process.env.PORT || 4000

app.listen(port, () =>{
    console.log(`Servidor funcionando en el puerto: ${port}`)
})