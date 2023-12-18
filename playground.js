const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const app = express();

const pool = new Pool({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database_name',
  password: 'your_password',
  port: 'your_port',
});

async function insertData(data) {
  const client = await pool.connect();

  try {
    for (const obj of data) {
      await client.query('INSERT INTO practice_table (name, age) VALUES ($1, $2)', [obj.name, obj.age]);
    }
  }catch (error){
      console.error('Error during data insertion:', error);
    
  } finally {
    client.release();
  }
}

app.use(express.json());

app.post('/insert', (req, res) => {
  const data = req.body;

  const successData = [];
  const failedData = [];

  for (const obj of data) {
    if (
      typeof obj.name === 'string' &&
      obj.name.length > 0 && obj.name.length <= 50 &&
      typeof obj.age === 'number' && obj.age >= 20 && obj.age <= 100
    ) {
      successData.push(obj);
    } else {
      failedData.push(obj);
    }
  }

 
  insertData(successData);

  
  writeCSV('success.csv', successData);
  writeCSV('failed.csv', failedData);

  const response = {
    success: {
      count: successData.length,
      data: successData,
    },
    failed: {
      count: failedData.length,
      data: failedData,
    },
  };

  res.json(response);
});


function writeCSV(filename, data) {
  const csvContent = data.map(obj => `${obj.name},${obj.age}`).join('\n');
  fs.writeFileSync(filename, csvContent);
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server is running on port ${PORT:3000}');
});