-- CREAR TABLAS
CREATE TABLE usuarios (
id INT PRIMARY KEY AUTO_INCREMENT,
email VARCHAR(20) NOT NULL UNIQUE,
pass VARCHAR(40) NOT NULL,
secret VARCHAR(40)
);

CREATE TABLE favoritos (
id INT PRIMARY KEY AUTO_INCREMENT,
titulo VARCHAR(50) NOT NULL,
resumen VARCHAR(200) NOT NULL,
url VARCHAR(300) NOT NULL,
idUsuario INT,
FOREIGN KEY(idUsuario) REFERENCES usuarios(id)
)

CREATE TABLE codigos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo INT NOT NULL,
    nombre VARCHAR(30) NOT NULL,
)


--CONSULTAR USUARIO
SELECT * FROM usuarios;

-- CONSULTAR UN USUARIO
SELECT email FROM favoritos;

-- ESCRIBIR
INSERT INTO usuarios (email, pass) VALUES
('chape@gmail.com', 'chapelas93');

-- BORRAR TABLA
DROP TABLE usuarios;

-- AÑADIR CONTENIDO A UNA TABLA
INSERT INTO favoritos (titulo,resumen, url, idUsuario)
VALUES('', '', '', '');

-- BORRAR CONTENIDO DE UNA TABLA
DELETE FROM favoritos WHERE id='3';

-- MODIFICAR 
ALTER TABLE favoritos ADD UNIQUE INDEX(url, idUsuario);
INSERT IGNORE INTO favoritos(...) VALUES (...)


INSERT INTO codigos (codigo, nombre) VALUES

(231, "A Coruña"),
(232, "Álava"),
(233, "Albacete"),
(234, "Alicante"),
(235, "Almería"),
(236, "Asturias"),
(237, " Ávila"),
(238, "Badajoz"),
(239, "Baleares"),
(240, "Barcelona"),
(241, "Bizkaia"),
(242, "Burgos"),
(243, "Cáceres"),
(244, "Cádiz"),
(245, "Cantabria"),
(246, "Castellón"),
(247,"Ceuta"),
(248, "Ciudad Real"),
(249, "Córdoba"),
(250, "Cuenca"),
(251, "Gipuzkoa"),
(252, "Girona"),
(253, "Granada"),
(254, "Guadalajara"),
(255, "Huelva"),
(256, "Huesca"),
(257, "Jaén"),
(258, 'La Rioja'),
(259, 'Las Palmas de Gran Canaria'),
(260, 'León'),
(261, 'Lugo'),
(262, 'Lleida'),
(263, 'Madrid'),
(264, 'Málaga'),
(265, 'Melilla'),
(266, 'Murcia'),
(267, 'Navarra'),
(268, 'Ourense'),
(269, 'Palencia'),
(270, 'Pontevedra'),
(271, 'Salamanca'),
(272, 'Sta. Cruz de Tenerife'),
(273, 'Segovia'),
(274, 'Sevilla'),
(275, 'Soria'),
(276, 'Tarragona'),
(277, 'Teruel'),
(278, 'Toledo'),
(279, 'Valencia'),
(280, 'Valladolid'),
(281, 'Zamora'),
(282, 'Zaragoza'),

INSERT INTO favoritos (titulo, resumen, url, idUsuario) VALUES ('Primera oferta', 'Esta es la primera oferta de prueba', 'url.url.url', 1);
