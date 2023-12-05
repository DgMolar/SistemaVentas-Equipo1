let dataCliente = "";
let negocioData = "";
$(document).ready(function () {
    console.log("Hola!!, Bienvenido!!");

    $("#cboBuscarCliente").select2({
        ajax: {
            url: '/Cliente/Lista',
            type: 'GET',
            dataType: 'json',
            data: function (params) {
                return {
                    busqueda: params.term
                };
            },
            processResults: function (response) {
                var data = response.data;
                return {
                    results: data.map(function (item) {
                        return {
                            id: item.idCliente,
                            nombre: item.nombre,
                            correo: item.correo,
                            rfc: item.rfc,
                            domicilioFiscalReceptor: item.domicilioFiscalReceptor,
                            regimenFiscalReceptor: item.regimenFiscalReceptor
                        };
                    })
                };
            }
        },
        placeholder: 'Buscar Cliente...',
        minimumInputLength: 1,
        templateResult: formatoResultados
    });

    // Capturar evento de selección de cliente
    $("#cboBuscarCliente").on("select2:select", function (e) {
        dataCliente = e.params.data;
        $("#nombreRazonSocial").val(dataCliente.nombre);
        $("#txtRFC").val(dataCliente.rfc);
        $("#txtCorreo").val(dataCliente.correo);
        $("#txtCP").val(dataCliente.domicilioFiscalReceptor);
        $("#txtRegimenFiscal").val(dataCliente.regimenFiscalReceptor);
    });

    $(document).on("select2:open", function () {
        document.querySelector(".select2-search__field").focus();
    });

    /*========================================================*/

    $("#btnBuscar").click(function () {
        const numeroVenta = $("#txtNumeroVenta").val().trim();
        if (numeroVenta === "") {
            toastr.warning("", "Debe ingresar el número de venta");
            return;
        }

        fetch(`/Venta/Historial?numeroVenta=${numeroVenta}`)
            .then(response => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then(responseJson => {
                
                let dataVenta = responseJson[0];
                console.log(dataVenta)

                // Actualizar campos con datos generales de la venta
                $("#txtFechaRegistro").val(dataVenta.fechaRegistro);
                $("#numVentaInput").val(dataVenta.numeroVenta);
                $("#txtUsuarioRegistro").val(dataVenta.idUsuario);

                // Llenar la tabla con los detalles de la venta
                $("#tbProductos tbody").empty(); // Limpiar la tabla antes de llenarla
                dataVenta.detalleVenta.forEach(item => {
                    $("#tbProductos tbody").append(
                        $("<tr>").append(
                            $("<td>").text(item.idProducto + "-" + item.descripcionProducto),
                            $("<td>").text(item.cantidad),
                            $("<td>").text(item.precio),
                            $("<td>").text(item.total)
                        )
                    );
                    buscarProducto(item.idProducto);
                })
                /*TOTALES*/
                $("#txtDescuento").val(dataVenta.descuento)
                $("#txtSubTotal").val(dataVenta.subTotal)
                $("#txtIGV").val(dataVenta.impuestoTotal)
                $("#txtTotal").val(dataVenta.total)


                /*CREACION DE XML*/
                document.getElementById("btnTimbrar").addEventListener("click", async () => {
                    console.log("Si entre")
                    let datos = "";
                    try {
                        await obtenerInfoNegocio(); // Asumiendo que esta función devuelve la info del negocio
                        console.log("Datos del Negociazo:",negocioData)
                        
                        
                        datos = {
                            Venta: {
                                idLocal: dataVenta.numeroVenta,
                                version: "4.0",
                                serie: $("#cboSerie").val(),
                                folio: "FACT" + dataVenta.numeroVenta,
                                formaPago: $("#cboFormaDePago").val(),
                                subTotal: dataVenta.subTotal,
                                descuento: dataVenta.descuento,
                                moneda: negocioData.simboloMoneda,
                                tipoCambio: $("#tipoCambio").val(),
                                total: dataVenta.total,
                                tipoDeComprobante: $("#cboTipoComprobante").val(),
                                metodoPago: $("#cboMetodoPago").val(),
                                lugarExpedicion: negocioData.direccion,
                                regimenFiscal: $("#regimenFiscal").val(),
                                rfc: dataCliente.rfc,
                                nombre: dataCliente.nombre,
                                domicilioFiscalReceptor: dataCliente.domicilioFiscalReceptor,
                                regimenFiscalReceptor: dataCliente.regimenFiscalReceptor,
                                usoCFDI: $("#usoCFDI").val()

                            },
                            DetalleVenta: [],
                            totalImporteTranslado: "0"
                        };

                        await Promise.all(
                            dataVenta.detalleVenta.map(async detalle => {

                                const productoData = await buscarProducto(detalle.idProducto);
                                const detalleVenta = {
                                    claveProdServ: productoData.claveProductoSat,
                                    noIdentificacion: detalle.idProducto.toString(),
                                    cantidad: detalle.cantidad.toString(),
                                    claveUnidad: productoData.unidadMedidaSat,
                                    unidad: productoData.unidadMedida,
                                    descripcion: detalle.descripcionProducto,
                                    valorUnitario: detalle.precio.toString(),
                                    importe: (detalle.cantidad * detalle.precio).toString(),
                                    objetoImp: productoData.objetoImpuesto,
                                    base: (detalle.cantidad * detalle.precio).toString(),
                                    impuesto: productoData.impuesto,
                                    tipoFactor: productoData.factorImpuesto,
                                    tasaOCuota: productoData.valorImpuesto,
                                    importeTranslado: (((detalle.cantidad * detalle.precio) * productoData.valorImpuesto) / 100).toString(),
                                };

                                datos.DetalleVenta.push(detalleVenta);
                            })
                        );
                        const totalImporteTranslado = datos.DetalleVenta.reduce((total, detalle) => {
                            return total + parseFloat(detalle.importeTranslado);
                        }, 0);

                        // Asignamos el total al campo correspondiente en datos.Venta
                        console.log(totalImporteTranslado)
                        datos.totalImporteTranslado = totalImporteTranslado.toString();
                        // Aquí se solicitaría el XML
                        let xmlGenerado = generarXML(datos);
                        console.log(xmlGenerado);
                        webService(xmlGenerado)
                        // Crear un blob con el contenido del XML
                        const blob = new Blob([xmlGenerado], { type: 'text/xml' });

                        // Crear un objeto URL para el blob
                        const url = window.URL.createObjectURL(blob);

                        // Crear un elemento de ancla para descargar el archivo
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'factura.xml'; // Nombre del archivo a descargar
                        a.click();

                        // Liberar el objeto URL
                        window.URL.revokeObjectURL(url);

                        /*location.reload();*/
                    } catch (error) {
                        console.error(error);
                        // Manejar errores según sea necesario
                    }
                });
            })
            .catch(error => {
                toastr.error("", "Error al obtener la información de la venta");
                console.error("Error:", error);
            });
    });
});









async function buscarProducto(idProducto) {
    try {
        const response = await fetch("/Producto/ObtenerPorId?idProducto=" + idProducto);
        if (!response.ok) {
            throw new Error('Error al obtener datos del producto');
        }
        const dataProductoResponse = await response.json();
        const dataProducto = dataProductoResponse.data;
        console.log("dataProducto Devuelve lo sig:", dataProducto);
        return dataProducto;
    } catch (error) {
        console.error('Error:', error);
        // Maneja el error según sea necesario
        return null; // O devuelve algún valor por defecto
    }
}

function formatoResultados(data) {
    if (data.loading) {
        return data.texto; // Muestra el texto "Buscando..." por defecto
    }

    var contenedor = $(
        `<table width="100%">
                <tr>
                    <td>
                        <p style="font-weight: bolder; margin: 2px">${data.nombre}</p>
                        <p style="margin: 2px">${data.rfc}</p>
                    </td>
                </tr>
             </table>`
    );

    return contenedor;
}



function obtenerInfoNegocio() {
    return fetch("/Negocio/Obtener")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos del negocio');
            }
            $(".card-body").LoadingOverlay("hide");
            return response.json();
        })
        .then(responseJson => {
            if (responseJson.estado) {
                negocioData = responseJson.objeto;
            } else {
                swal("Lo sentimos", responseJson.mensaje, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Agrega manejo de errores más específico según sea necesario
        });
}


function generarXML(datos) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Comprobante>\n`;
    xml += `\t<idLocal>${datos.Venta.idLocal}</idLocal>\n`;
    xml += `\t<version>${datos.Venta.version}</version>\n`;
    xml += `\t<serie>${datos.Venta.serie}</serie>\n`;
    xml += `\t<folio>${datos.Venta.folio}</folio>\n`;
    xml += `\t<formaPago>${datos.Venta.formaPago}</formaPago>\n`;
    xml += `\t<subTotal>${datos.Venta.subTotal}</subTotal>\n`;
    xml += `\t<descuento>${datos.Venta.descuento}</descuento>\n`;
    xml += `\t<moneda>${datos.Venta.moneda}</moneda>\n`;
    xml += `\t<tipoCambio>${datos.Venta.tipoCambio}</tipoCambio>\n`;
    xml += `\t<total>${datos.Venta.total}</total>\n`;
    xml += `\t<tipoDeComprobante>${datos.Venta.tipoDeComprobante}</tipoDeComprobante>\n`;
    xml += `\t<metodoPago>${datos.Venta.metodoPago}</metodoPago>\n`;
    xml += `\t<lugarExpedicion>${datos.Venta.lugarExpedicion}</lugarExpedicion>\n`;
    xml += `\t<regimenFiscal>${datos.Venta.regimenFiscal}</regimenFiscal>\n`;
    xml += `\t<rfc>${datos.Venta.rfc}</rfc>\n`;
    xml += `\t<nombre>${datos.Venta.nombre}</nombre>\n`;
    xml += `\t<domicilioFiscalReceptor>${datos.Venta.domicilioFiscalReceptor}</domicilioFiscalReceptor>\n`;
    xml += `\t<regimenFiscalReceptor>${datos.Venta.regimenFiscalReceptor}</regimenFiscalReceptor>\n`;
    xml += `\t<usoCFDI>${datos.Venta.usoCFDI}</usoCFDI>\n`;

    // Agregar cada Concepto dinámicamente (pueden ser múltiples)
    datos.DetalleVenta.forEach(detalle => {
        xml += `\t<Concepto>\n`;
        xml += `\t\t<claveProdServ>${detalle.claveProdServ}</claveProdServ>\n`;
        xml += `\t\t<noIdentificacion>${detalle.noIdentificacion}</noIdentificacion>\n`;
        xml += `\t\t<cantidad>${detalle.cantidad}</cantidad>\n`;
        xml += `\t\t<claveUnidad>${detalle.claveUnidad}</claveUnidad>\n`;
        xml += `\t\t<unidad>${detalle.unidad}</unidad>\n`;
        xml += `\t\t<descripcion>${detalle.descripcion}</descripcion>\n`;
        xml += `\t\t<valorUnitario>${detalle.valorUnitario}</valorUnitario>\n`;
        xml += `\t\t<importe>${detalle.importe}</importe>\n`;

        xml += `\t\t<objetoImp>${detalle.objetoImp}</objetoImp>\n`;
        xml += `\t\t<Traslado>\n`;
        xml += `\t\t\t<base>${detalle.base}</base>\n`;
        xml += `\t\t\t<impuesto>${detalle.impuesto}</impuesto>\n`;
        xml += `\t\t\t<tipoFactor>${detalle.tipoFactor}</tipoFactor>\n`;
        xml += `\t\t\t<tasaOCuota>${detalle.tasaOCuota}</tasaOCuota>\n`;
        xml += `\t\t\t<importe>${detalle.importeTranslado}</importe>\n`;
        xml += `\t\t</Traslado>\n`;

        xml += `\t</Concepto>\n`;
    });

    xml += `\t<totalImpuestosTrasladados>${datos.totalImporteTranslado}</totalImpuestosTrasladados>\n`;
    xml += `</Comprobante>`;

    return xml;
}



function webService(xmlGenerado) {
    console.log("Llamando a web service!");

    var xmlhttp = new XMLHttpRequest();
    var url = "https://ws.urbansa.com/app/timbrado.asmx";
    var soapRequest =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '  <soap:Body>' +
        '    <TimbrarF xmlns="http://ws.urbansa.com/">' +
        '      <Usuario>FIME</Usuario>' +
        '      <Password>s9%4ns7q#eGq</Password>' +
        '      <StrXml>' + xmlGenerado + '</StrXml>' +
        '    </TimbrarF>' +
        '  </soap:Body>' +
        '</soap:Envelope>';

    xmlhttp.open('POST', url, true);
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    xmlhttp.setRequestHeader('SOAPAction', 'http://ws.urbansa.com/TimbrarF');
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                var response = xmlhttp.responseXML;
                // Aquí puedes manejar la respuesta del servicio web
                console.log(response);
            }
        }
    }
    xmlhttp.send(soapRequest);
}