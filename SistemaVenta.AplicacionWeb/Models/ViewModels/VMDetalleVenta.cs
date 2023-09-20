using SistemaVenta.Entity;

namespace SistemaVenta.AplicacionWeb.Models.ViewModels
{
    public class VMDetalleVenta
    {


        public int? IdProducto { get; set; }

        public string? MarcaProducto { get; set; }

        public string? DescripcionProducto { get; set; }

        public string? CategoriaProducto { get; set; }

        public int? Cantidad { get; set; }

        public decimal? Precio { get; set; }

        public decimal? Total { get; set; }
        public object FechaRegistro { get; internal set; }
        public object NumeroVenta { get; internal set; }
        public object TipoDocumento { get; internal set; }
        public object DocumentoCliente { get; internal set; }
        public object NombreCliente { get; internal set; }
        public object SubTotalVenta { get; internal set; }
        public object ImpuestoTotalVenta { get; internal set; }
        public object TotalVenta { get; internal set; }
        public object Producto { get; internal set; }
    }
}
