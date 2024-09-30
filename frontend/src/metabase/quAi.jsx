import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Databases from './entities/databases';
import Schemas from './entities/schemas';
import Tables from './entities/tables';
import Questions from "./entities/questions";

const DatabaseList = () => {
  const dispatch = useDispatch();
  const [selectedDatabaseId, setSelectedDatabaseId] = useState(null);
  const [tables, setTables] = useState({});
  const [schemas, setSchemas] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");

  const databases = useSelector((state) =>
    Databases.selectors.getListUnfiltered(state, {})
  );

  useEffect(() => {
    dispatch(Databases.api.list());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDatabaseId) {
      Schemas.api
        .list({ dbId: selectedDatabaseId }, dispatch)
        .then((fetchedSchemas) => {
          setSchemas(fetchedSchemas);
        })
        .catch((error) => console.error('Error fetching schemas:', error));
    }
  }, [selectedDatabaseId, dispatch]);

  useEffect(() => {
    if (selectedDatabaseId && schemas.length > 0) {
      schemas.forEach((schema) => {
        Tables.api
          .list({ dbId: selectedDatabaseId, schemaId: schema.id }, dispatch)
          .then((fetchedTables) => {
            // Logando os detalhes das tabelas recebidas
            fetchedTables.forEach(table => {
              console.log(`Tabela recebida para schema ${schema.name}:`, table);
            });

            setTables((prevTables) => ({
              ...prevTables,
              [schema.id]: fetchedTables,
            }));
          })
          .catch((error) => console.error(`Error fetching tables for schema ${schema.name}:`, error));
      });
    }
  }, [selectedDatabaseId, schemas, dispatch]);

  

  const handleUserQuestionChange = (e) => {
    setUserQuestion(e.target.value);
  };

  const handleSubmitQuestion = async () => {
    const availableData = schemas.map(schema => ({
      schema: schema.name,
      tables: (tables[schema.id] || []).map(table => {
        const fieldNames = table.fields.map(field => field.name).join(', ');
        return `${table.name} (campos: ${fieldNames})`;
      }),
    }));
  
    const payload = {
      userQuestion,
      availableData,
    };
  
    try {
      const response = await fetch('/api/openai/generate-sql', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error('Erro ao comunicar com o servidor');
      }
  
      // Corrigido: Use await para processar JSON corretamente
      const sqlQuery = await response.text(); 
  
      console.log('Generated SQL:', sqlQuery);
  
      const cardDetails = {
        name: "Consulta via QuAi",
        dataset_query: {
          type: "native",
          native: { query: sqlQuery },
          database: selectedDatabaseId,
        },
        display: "table",
        visualization_settings: {},
      };
  
      dispatch(Questions.api.create(cardDetails, dispatch)).then((newCard) => {
        console.log(newCard);
        const cardId = newCard.id; 
  
        window.location.href = `/question/${cardId}`;
      }).catch(error => {
        console.error('Erro ao criar o card:', error);
      });
  
    } catch (error) {
      console.error('Erro ao gerar o SQL:', error);
    }
  };
  
  
  return (
    <div>
      <h1>Lista de Bancos de Dados</h1>
      <select onChange={(e) => setSelectedDatabaseId(parseInt(e.target.value, 10))} value={selectedDatabaseId || ''}>
        <option value="" disabled>
          Selecione um banco de dados
        </option>
        {databases.map((db) => (
          <option key={db.id} value={db.id}>
            {db.name}
          </option>
        ))}
      </select>
      <br/>
      {selectedDatabaseId && schemas.length > 0 && (
        <div>
          <h2>Schemas e Tabelas</h2>
          {schemas.map((schema) => (
            <div key={schema.id}>
              <h3>{schema.name}</h3>
              <ul>
                {(tables[schema.id] || []).map((table) => (
                  <li key={table.id}>{table.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <br/>
      <textarea
        placeholder="Digite sua pergunta aqui..."
        value={userQuestion}
        onChange={handleUserQuestionChange}
        rows={4}
        cols={50}
      />
      <br/>
      <button onClick={handleSubmitQuestion}>Enviar Pergunta</button>
    </div>
  );
};

export default DatabaseList;
