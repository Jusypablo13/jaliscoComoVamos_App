// controllers/dashboardController.ts
import { Request, Response } from 'express';
import { pool } from '../db'; // Tu conexión a PostgreSQL
import { DASHBOARD_CONFIG } from '../config/dashboardMap';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { category } = req.params; // Ejemplo: 'economia'
    // Filtros que vienen del Modal (query params)
    const { municipio, sexo, edad } = req.query; 

    // 1. Validar categoría
    const chartConfigs = DASHBOARD_CONFIG[category as keyof typeof DASHBOARD_CONFIG];
    if (!chartConfigs) {
      return res.status(404).json({ error: 'Categoría no válida' });
    }

    // 2. Construir cláusula WHERE dinámica (Filtros)
    // Usamos parámetros ($1, $2) para seguridad contra SQL Injection
    let whereClause = 'WHERE 1=1'; 
    const queryParams: any[] = [];
    let paramCounter = 1;

    if (municipio) {
      whereClause += ` AND "Q_94" = $${paramCounter}`; // Q_94 es Municipio
      queryParams.push(municipio);
      paramCounter++;
    }
    if (sexo) {
      whereClause += ` AND "Q_74" = $${paramCounter}`; // Q_74 es Sexo
      queryParams.push(sexo);
      paramCounter++;
    }
    // ... agregar más filtros aquí (edad, nse, etc.) ...

    // 3. Generar consultas para cada gráfica de esta categoría
    const promises = chartConfigs.map(async (config) => {
      let sql = '';
      
      // Lógica A: Distribución (Ej. Cuántos tienen 1 auto, 2 autos...)
      if (config.sqlLogic === 'DISTRIBUTION' || config.sqlLogic === 'BINARY_COUNT') {
        sql = `
          SELECT "${config.column}" as key, COUNT(*) as value
          FROM encuestalol
          ${whereClause}
          AND "${config.column}" IS NOT NULL
          GROUP BY "${config.column}"
          ORDER BY "${config.column}" ASC
        `;
      } 
      // Lógica B: Promedios por Municipio (Ej. Calidad de vida en GDL vs Zapopan)
      else if (config.sqlLogic === 'AVERAGE_BY_MUNI') {
        sql = `
          SELECT m.nombre as label, AVG(e."${config.column}") as value
          FROM encuestalol e
          JOIN municipios m ON e."Q_94" = m.id
          ${whereClause.replace('"Q_94"', 'e."Q_94"')} -- Ajuste de alias
          AND e."${config.column}" BETWEEN 1 AND 5 -- Filtramos basura
          GROUP BY m.nombre
          ORDER BY value DESC
        `;
      }

      // Ejecutar Query
      const result = await pool.query(sql, queryParams);
      
      // Formatear Datos para el Frontend
      const formattedData = result.rows.map((row: { key?: string; label?: string; value: string | number }) => ({
        label: ('labels' in config && config.labels) ? (config.labels as Record<string, string>)[row.key as string] || row.key || row.label : row.label, // Usar etiqueta legible si existe
        value: Number(row.value) // Asegurar que sea número
      }));

      return {
        id: config.id,
        title: config.title,
        type: config.type,
        data: formattedData
      };
    });

    // 4. Esperar a que todas las gráficas se calculen
    const chartsData = await Promise.all(promises);

    // 5. Responder al Frontend
    res.json({
      category: category,
      charts: chartsData
    });

  } catch (error) {
    console.error('Error en dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};