import nodemailer from "nodemailer"

const emailOlvidePassword = async (datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port:  process.env.EMAIL_PORT,
        auth: {
          user:  process.env.EMAIL_USER,
          pass:  process.env.EMAIL_PASS,
        }
      });

      const {nombre, email, token} = datos

      //enviar email
      const info = await transport.sendMail({
        from : "APV- Veterinaria",
        to: email,
        subject : 'Restablece tu Passrword',
        text : "Restablece tu Passrword",
        html: `<p>Hola: ${nombre}, has solicitado restablecer tu password</p>
              <p>sigue el suguiente enlace, para generar un nuevo password:</p>
              <a href ="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password</a>

              <p>Si tu no creaste esta cuenta, puedes ignorar este correo</p>        
        `
      })

      console.log("Mensaje Enviado: %s", info.messageId)
    
}



export default emailOlvidePassword