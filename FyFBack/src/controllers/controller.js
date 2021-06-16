// -------------------------------------------------------------------------------
// Node modules
// -------------------------------------------------------------------------------

const md5 = require('md5')
const jwt = require('jsonwebtoken');
const axios = require('axios')
const fetch = require('node-fetch')
const nodemailer = require('nodemailer')
const randomstring = require("randomstring");
const cheerio = require('cheerio')
const {registerNewUser, checkUser, deleteSecret, deleteFav, readFavorite, registerNewFav, changeCodes, doQuery, registerNewUserGoogle} = require('../database/db')

// -------------------------------------------------------------------------------
// Aux Functions
// -------------------------------------------------------------------------------
function validateEmail(email) {
    let patternEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return patternEmail.test(email);  
 }

function validatePass(pass) {
    let patternPass = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return patternPass.test(pass);  
}

// -------------------------------------------------------------------------------
// Logic
// -------------------------------------------------------------------------------

const signUp = async (email, pass) => { 
    const USER = {
        email: email,
        pass: md5(pass)
    }
    const result = await registerNewUser(USER)
    return result
}

const signIn = async (email, pass) => {
    const result = await checkUser(email, md5(pass))
    return result
}

const signOut = async token => {
    const result = await deleteSecret(token);
    return result;
}

const saveFavorite = async (titulo, resumen, url, token) => {
    let decode = jwt.decode(token)
    const NEWFAV = { 
        titulo: titulo, 
        resumen: resumen, 
        url: url, 
        idUsuario: decode.id,
        token: decode
    }
        const result = await registerNewFav(NEWFAV)
        return result
}

const readFav = async token => {
    const result = await readFavorite(token);
    return result
}

const deleteFavorite = async (url, token) => {
    let decode = jwt.decode(token)
    if (decode.email) {
        const result = await deleteFav(url);
        return result
    } else {
        const result = {
            status: 400,
            data: "No tienes token, no autorizado",
            ok: false
        }
        return result
    }
}

// Primer scraper
const searchJobs = async (location, key) => {
    const TERM = {
        localizacion: location
    }

    const val = async location => {
        if(location === "nada") {
            const html = await axios.get(`https://www.tecnoempleo.com/busqueda-empleo.php?te=${key}&ex=,1,#buscador-ofertas-ini`)
            return html
        }else{
            const codigo = await changeCodes(TERM) 
            const html = await axios.get(`https://www.tecnoempleo.com/busqueda-empleo.php?te=${key}${'&pr=,' + codigo + ','},&ex=,1,#buscador-ofertas-ini`)
            return html
        }
    }

    const result2 = await val(location)

    const $ = await cheerio.load(result2.data);

    let resumenes = [];
    let titulos = [];
    let urls = [];

    $('a.text-gray-700.font-weight-bold').each(function () {
        titulos.push($(this).text().trim().replace(/\t|\n/g, ""));
    });

    $('span.d-block.fs--15.hidden-md-down.lead.text-gray-800').each(function () {
        resumenes.push($(this).text().trim().replace(/\t|\n/g, ""))
    });

    $('a.text-gray-700.font-weight-bold').each(function () {
        urls.push($(this).attr("href"));
    });

    const result = resumenes.map((el, i) => {
        const obj = { titulo: titulos[i], resumen: el, url: urls[i] }
        return obj
    })
    
    return result;
}

// Segundo scraper
const searchJobs2 = async (location, key) => {
    const val = async location => {
        if(location === "nada") {
            const html = await axios.get(`https://es.jooble.org/SearchResult?ukw=${key}&workExp=2`)
            return html
        }else{
            const html = await axios.get(`https://es.jooble.org/SearchResult?rgns=${location}&ukw=${key}&workExp=2`);            
            return html
        }
    }
    
    const result2 = await val(location)

    const $ = await cheerio.load(result2.data);

    let resumenes = [];
    let titulos = [];
    let urls = [];

    $('span.a7df9').each(function () {
        titulos.push($(this).text().trim().replace(/\t|\n/g, ""));
    });
    $('div._0b1c1').each(function () {
        resumenes.push($(this).text().trim().replace(/\t|\n/g, ""));
    });
    // link = $('a')
    $('a.baa11._1d27a.button_size_M.d95a3._2c371._70395').each(function () {
        urls.push($(this).attr("href").replace(/(m\/)/g, ""));
    });

    const result = resumenes.map((el, i) => {
        const obj = {titulo: titulos[i], resumen: el, url: `http://es.jooble.org` + urls[i]}
        return obj
    })

    return result;
}

const newPass = async (email) => {
    const sql = `SELECT * FROM usuarios WHERE email = "${email}"`;
    const response = await doQuery(sql);
    let result;

    if (response.length !== 0) {
        const token = jwt.sign({email: email} , response[0].pass);
        const link = `https://fyf-greenteam.netlify.app/pass/recuperar/?token=${token}`;
        try {
            await mailer(email, link)
                .then(res => {
                    if(res) {
                        result = {
                            status: 200,
                            data: `Correo electrónico mandado a ${email}`,
                            ok: true
                        }
                    }
                    else {
                        result = {
                            status: 404,
                            data: "Algo ha salido mal...",
                            ok: false
                        }
                    } 
                }) 
            
        } catch (error) {
            result = {
                status:500,
                data: `Error al mandar correo a ${email}: error`,
                ok: false
            }
        }
    } else {
        result = {
            status: 406,
            data: "Este correo no existe",
            ok:false
        }
    }

    return result;
};

const changePass = async (newPass, token) => {
    if (validatePass(newPass)) {
        try {
            const decode = jwt.decode(token);
            const sql = `SELECT * FROM usuarios WHERE email = "${decode.email}"`;
            const response = await doQuery(sql);

            if (response.length !== 0) {
                const pass = response[0].pass;
                try {
                    const res = jwt.verify(token, pass);
                    if (res.email) {
                        const newSecret = randomstring.generate();
                        const sql2 = `UPDATE usuarios SET secret = "${newSecret}", pass = "${md5(newPass)}" WHERE email = "${decode.email}"`;
                        const response = await doQuery(sql2);
                        return (response.changedRows > 0) ? {
                            status: 200,
                            data: 'Password cambiada',
                            ok:true
                        } : {
                            status: 406,
                            data: "Algo va mal...",
                            ok: false
                        }
                    } 
                    else  {
                        const result = {
                            status: 500,
                            data: "La contraseña ya ha sido cambiada",
                            ok: false
                        }
                        return result
                    }
                } catch (error) {
                    const result = {
                    OK: 0,
                    error: 401,
                    message: `Token no válido: ${error.message}`,
                    }
                    return result
                }
        }
        } catch (error) {
            const result = {
                status: 400,
                data: `No hay token.`,
                ok: false
            }
            return result
        }
    }
};

const mailer = (email, link) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'tbgreenteam@gmail.com',
            pass: 'josjoschapcon'
        }
    });

    const mailOptions = {
        from: 'FyF Tu Portal de Empleo IT',
        to: email,
        subject: 'RECUPERACION DE CONTRASEÑA',
        text: `Pincha aquí para recuperar tu contraseña ${link}`
    };

    return new Promise ((res, rej) => {
         transporter.sendMail(mailOptions, function(error, info){
            if (error){
                console.log(error);
                res(false) 
            } else {
                res(true) 
            }
        });
    })
}

const signUpGoogle = async (email, pass) => {
    const USER = {
        email,
        pass: md5(pass)
    }
    const result = await registerNewUserGoogle(USER)
    return result   
}

// -------------------------------------------------------------------------------
// Export modules
// -------------------------------------------------------------------------------

module.exports = {signUp, signIn, signOut, searchJobs, searchJobs2, saveFavorite, validateEmail, validatePass, deleteFavorite, readFav, newPass, changePass, signUpGoogle}