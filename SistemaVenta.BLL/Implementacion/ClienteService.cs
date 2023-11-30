using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text;
using SistemaVenta.BLL.Interfaces;
using SistemaVenta.DAL.Interfaces;
using SistemaVenta.Entity;

namespace SistemaVenta.BLL.Implementacion
{
    public class ClienteService : IClienteService
    {
        private readonly IGenericRepository<Cliente> _repositorio;

        public ClienteService(
            IGenericRepository<Cliente> repositorio
            )
        {
            _repositorio = repositorio;
        }
        public Task<Cliente> Crear(Cliente entidad)
        {
            throw new NotImplementedException();
        }

        public Task<Cliente> Editar(Cliente entidad)
        {
            throw new NotImplementedException();
        }

        public Task<bool> Eliminar(int idCliente)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Cliente>> Lista()
        {
            IQueryable<Cliente> query = await _repositorio.Consultar();
            return query.ToList();
        }

        public Task<Cliente> ObtenerPorId(int idCliente)
        {
            throw new NotImplementedException();
        }
    }
}
