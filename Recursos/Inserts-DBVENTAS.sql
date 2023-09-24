
--________________________________ INSERTAR NUMERO CORRELATIVO ________________________________
select * from NumeroCorrelativo
--000001
insert into NumeroCorrelativo(ultimoNumero,cantidadDigitos,gestion,fechaActualizacion) values
(0,6,'venta',getdate())


--________________________________ RECURSOS DE FIREBASE_STORAGE Y CORREO ________________________________
--(AQUI DEBES INCLUIR TUS PROPIAS CLAVES Y CRENDENCIALES)
select * from Configuracion
insert into Configuracion(recurso,propiedad,valor) values
('Servicio_Correo','correo','codigoestudiante211@gmail.com'),
('Servicio_Correo','clave','tmldsptgeohtjdcu'),
('Servicio_Correo','alias','MiTienda.com'),
('Servicio_Correo','host','smtp.gmail.com'),
('Servicio_Correo','puerto','587')

insert into Configuracion(recurso,propiedad,valor) values
('FireBase_Storage','email','codigo900@gmail.com'),
('FireBase_Storage','clave','codigo900'),
('FireBase_Storage','ruta','mitiendaonline-239e3.appspot.com'),
('FireBase_Storage','api_key','AIzaSyB9u7M2ucNn59k-fxeR0qiNLrIgNjbKhsg'),
('FireBase_Storage','carpeta_usuario','IMAGENES_USUARIO'),
('FireBase_Storage','carpeta_producto','IMAGENES_PRODUCTO'),
('FireBase_Storage','carpeta_logo','IMAGENES_LOGO')

--_________________________________VIDEO 11______________________________________--
--________________________________ INSERTAR ROLES ________________________________
insert into rol(descripcion,esActivo) values
('Administrador',1),
('Empleado',1),
('Supervisor',1)


--________________________________ INSERTAR USUARIO ________________________________
SELECT * FROM Usuario
--clave : 123
insert into Usuario(nombre,correo,telefono,idRol,urlFoto,nombreFoto,clave,esActivo) values
('codigo estudiante','codigo@example.com','909090',1,'','','a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',1)



--_________________________________VIDEO 12______________________________________--
--________________________________ INSERTAR NEGOCIO ________________________________
select * from Negocio

insert into Negocio(idNegocio,urlLogo,nombreLogo,numeroDocumento,nombre,correo,direccion,telefono,porcentajeImpuesto,simboloMoneda)
values(1,'','','','','','','',0,'')



--_________________________________VIDEO 14______________________________________--
--________________________________ INSERTAR CATEGORIAS ________________________________
SELECT * FROM Categoria

INSERT INTO Categoria(descripcion,esActivo) values
('Computadoras',1),
('Laptops',1),
('Teclados',1),
('Monitores',1),
('Microfonos',1)