const express = require("express");
const { Pool } = require("pg");
const { generarReportes } = require("./generarReportes");

const app = express();

app.listen(3000, () => console.log("servidor ok"));

const pool = new Pool({
  host: "localhost",
  database: "joyas",
  password: "XXXXXX",
  user: "postgres",
  allowExitOnIdle: true,
});

// Requerimiento 1 desafio
app.get("/joyas", generarReportes, async (req, res) => {
  try {
    const { limits, order_by, page } = req.query;
    let consultas = "";
    if (order_by) {
      const [campo, orden] = order_by.split("_");
      consultas += ` ORDER BY ${campo} ${orden} `;
    }
    if (limits) {
      consultas += ` LIMIT ${limits} `;
    }
    if (page && limits) {
      const offset = (page * limits) - limits;
      consultas += ` OFFSET ${offset} `;
    }

    const query = `SELECT * FROM inventario ${consultas};`;

    const { rows: joyas } = await pool.query(query);

    const resultsHATEOAS = joyas.map((joya) => {
      return {
        name: joya.nombre,
        href: `/joyas/joya/${joya.id}`,
      };
    });

    const totalJoyas = joyas.length;

    const stockTotal = joyas.reduce(
      (acumulador, valorActual) => acumulador + valorActual.stock,0);
   
      res.json(resultsHATEOAS,totalJoyas,stockTotal)
    
    
  } catch (error) {
    res.status(500).send(error);
  }
});


//Requerimiento 2 desafio
app.get("/joyas/filtros",generarReportes, async (req, res) => {
  try {
    const { precio_max, precio_min, metal, categoria } = req.query;
    let filtros = [];
    const values = [];
    const agregarAlFiltro = (campo, comparador, valor) => {
      //CAMPO = ID, COMPARADOR = "=", POSICION = 1
      values.push(valor);
      const posicion = filtros.length + 1;
      filtros.push(` ${campo} ${comparador} $${posicion} `);
    };
    if (precio_max) {
      agregarAlFiltro("precio", "<=", precio_max);
    }
    if (precio_min) {
      agregarAlFiltro("precio", ">=", precio_min);
    }
    if (categoria) {
      agregarAlFiltro("categoria", "=", categoria);
    }
    if (metal) {
      agregarAlFiltro("metal", "=", metal);
    }
    // SELECT * FROM inventario WHERE catergoria = anillo AND metal = oro
    const nuevosFiltros = filtros.join(" AND ");

    if (precio_max || precio_min || categoria || metal) {
      filtros = ` WHERE ${nuevosFiltros} `; 
      const query = `SELECT * FROM inventario ${filtros};`;
      const { rows: joyas } = await pool.query(query, values);
      res.json(joyas);
    } 
    
    if (!precio_max && !precio_min && !categoria && !metal) {
      const query = `SELECT * FROM inventario;`;
      const { rows: joyas } = await pool.query(query, values);
      res.json(joyas);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//Ruta para consultar la base de dato por id
app.get("/joyas/joya/:id", generarReportes, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM inventario WHERE id = $1;`;
    const values = [id];
    const { rows: data } = await pool.query(query, values);
    res.json(data)
  } catch (error) {
    res.status(500).send(error);
  }
});