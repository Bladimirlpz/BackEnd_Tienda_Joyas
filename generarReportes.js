const generarReportes = (req,res, next) => {
    const url = req.url
    const query = req.query
    console.log(`se ha recibido una consulta a la ruta: ${url} de la tabla de inventario con las siguientes querys:`,query)
    next()
}

module.exports = {generarReportes}