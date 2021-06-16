// -------------------------------------------------------------------------------
// CONEXIÓN DB 
// -------------------------------------------------------------------------------
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const md5 = require('md5')
const randomstring = require("randomstring");
const connection = mysql.createConnection({
        host     : process.env.HOST,
        user     : process.env.USER,
        password : process.env.PASS,
        database : process.env.DB
});

connection.connect();

// -------------------------------------------------------------------------------
// LOGICA
// -------------------------------------------------------------------------------

const registerNewUser = USER => {
        const secret = randomstring.generate();
        return new Promise((res, rej) => { 
                connection.query(`INSERT INTO usuarios (email, pass, secret) VALUES ("${USER.email}","${USER.pass}", "${secret}")`, function (error, results, fields)  {
                        if (error) {
                                const result = {
                                        status: 400,
                                        data: "Usuario ya existe",
                                        ok: false
                                }
                                res(result) 
                        }
                        else {
                                const result = {
                                        status: 200,
                                        data: "Usuario creado",
                                        url: '/signin',
                                        ok: true
                                }
                                res(result)
                        }   
                });
        })
}

const checkUser = (email, pass) => {
        return new Promise((res, rej) => {   
                connection.query(`SELECT secret, id FROM usuarios WHERE email = '${email}' AND pass = '${pass}'`, function(err, results, fields){
                        if (err) {
                                console.log(err);
                                res(false)
                        }
                        else if (results[0]?.secret) {
                                let token = jwt.sign({ email: email, id: results[0].id }, results[0].secret,  {expiresIn: 60*60})
                                const result = {
                                status: 200,
                                data: "Usuario logeado correctamente",
                                token: token,
                                ok: true
                                }
                                res(result) 
                        }
                        else if(results[0] == undefined) {
                                const result = {
                                        status: 401,
                                        data: "Email o contraseña incorrect@s",
                                        ok: false,
                                        
                                }
                                res(result) 
                        }
                })
        })
}

const readFavorite = token => {
        const decode = jwt.decode(token)
     
        if (decode.email) {
                return new Promise((res, rej) => {
                        connection.query(`SELECT * FROM favoritos WHERE idUsuario = ${decode.id}`, function (error, result, fields)  {
                                if (error) {
                                        res(false) 
                                }
                                else {
                                        res(result)
                                }           
                        })
                })
        } else {
                const result = {
                        status: 400,
                        data: "Token not found",
                        url: "/",
                        ok: false
                }
                return result
        }
}

const deleteSecret = token => {
        const secret = randomstring.generate();
        const decode = jwt.decode(token); 
        if(decode.email){
                return new Promise((res, rej) => {
                        connection.query(`UPDATE usuarios SET secret= "${secret}" WHERE email= "${decode.email}"`, function(err, results){
                                if(err) {
                                        const result = {
                                                status : 406,
                                                data: "Algo salió mal...",
                                                ok: false,
                                        };
                                        res(result) 
                
                                } else if (results.changedRows == 1) {
                                        const result = {
                                                status: 200,
                                                data: "Logout correctly",
                                                url : "/",
                                                ok: true
                                        }
                                        res(result) 
                                } else {
                                        const result = {
                                                status: 401,
                                                data: "Algo va mal...",
                                                ok: false
                                        }
                                        res(result)
                                }
                                
                        })
                })
        } else {
                const result = {
                        status: 400,
                        data: "Token not found",
                        url: "/",
                        ok: false
                }
                return result
        }
}

const deleteFav = async url => {
        return new Promise ((res, rej) => {
                connection.query(`DELETE FROM favoritos WHERE url = "${url}"`, function (error, results) {
                        if (error) {
                                const result = {
                                        status: 406,
                                        data: "Algo va mal",
                                        ok: false,
                                        url: "/" 
                                }
                                rej(result) 
                        } else if(results.affectedRows === 1){
                                const result = {
                                        status: 200,
                                        data: "Se ha eliminado tu favorito",
                                        ok: true,
                                        url: "/"
                                }
                                res(result)
                        } else {
                                const result = {
                                        status: 401,
                                        data: "Tu favorito no existe",
                                        ok: false,
                                        url: "/"
                                }
                                res(result)
                        }
                });
        })
}

const registerNewFav = NEWFAV => {
        if (NEWFAV.token.email){
                return new Promise((resolve, reject) => {
                        connection.query(`INSERT IGNORE INTO favoritos (titulo,resumen, url, idUsuario) VALUES ("${NEWFAV.titulo}","${NEWFAV.resumen}","${NEWFAV.url}","${NEWFAV.idUsuario}")`, function (error, results, fields)  {
                                if (error) {
                                        const result = {
                                                status: 401,
                                                data: "Ha ocurrido un error",
                                                ok: false,
                                                url: '/'
                                        }
                                        resolve(result);
                                }
                                else if(results.affectedRows === 0) {
                                        const result = {
                                                status: 406,
                                                data: "Esta oferta favorita ya existe",
                                                ok: false
                                        }
                                        resolve(result);
                                } else {
                                        const result = {
                                                status: 200,
                                                data: "Oferta favorita guardada correctamente",
                                                ok: true
                                        }
                                        resolve(result);
                                }   
                        })
                })
        }
        else {
                const result = {
                    status: 400,
                    data: "No tienes token, no autorizado",
                    ok: false
                }
                return result
            }
}

const changeCodes = async TERM => { 
        return new Promise ((resolve, reject) => {
                connection.query(`SELECT codigo FROM  codigos WHERE nombre = ('${TERM.localizacion}')`, function (error, results, fields)  {
                        if(error) {
                                reject(error)
                        }
                        else {
                                resolve(results[0].codigo)
                        }
                })
        })
}

const doQuery = async param => {
        return new Promise((resolve, reject) => {
                connection.query(param, function(err, res) {
                        if (err) {
                                rej(false)
                        }
                        else {
                                resolve(res)
                        }
                } )
        })
}

const registerNewUserGoogle = USER => {
        return new Promise((res, rej) => {
                const secret = randomstring.generate();
                connection.query(`INSERT INTO usuarios (email, pass, secret) VALUES ("${USER.email}","${USER.pass}", "${secret}")`, function (error, results, fields) {
                        if (error) {
                                const result = {
                                        status: 405,
                                        data: "Usuario ya existe",
                                        ok: false
                                }
                                res(result) 
                        }
                        else {
                                connection.query(`SELECT secret, id FROM usuarios WHERE email = '${USER.email}'`, function(err, results, fields){
                                        if (err){
                                                console.log(err);
                                                res(false)
                                        }
                                        else if (results[0]?.secret){
                                                let token = jwt.sign({email : USER.email, id: results[0].id}, results[0].secret, {expiresIn: 60*60})
                                                const result = {
                                                        status:200,
                                                        data: "Usuario creado correctamente", 
                                                        token,
                                                        ok: true
                                                }
                                                res(result)
                                        }
                                        else if (results[0] == undefined){
                                                const result = {
                                                        status: 400, 
                                                        data: "Email o contraseña incorrect@s", 
                                                        ok: false
                                                }
                                                res(result)
                                        }
                                })
                        }
                })
        })
}

// -------------------------------------------------------------------------------
// Export modules
// -------------------------------------------------------------------------------

module.exports = {registerNewUser, deleteSecret, deleteFav, checkUser, readFavorite, registerNewFav, changeCodes, doQuery, registerNewUserGoogle}