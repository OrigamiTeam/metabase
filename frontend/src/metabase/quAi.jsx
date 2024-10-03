import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Databases from './entities/databases';
import Schemas from './entities/schemas';
import Tables from './entities/tables';
import Questions from "./entities/questions";
import ButtonRoot from '../metabase/core/components/Button';


const DatabaseList = () => {
  const dispatch = useDispatch();
  const [selectedDatabaseId, setSelectedDatabaseId] = useState(null);
  const [tables, setTables] = useState({});
  const [schemas, setSchemas] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para rastrear o carregamento

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
    setIsLoading(true); // Defina o estado de carregamento para verdadeiro
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
  
      dispatch(Questions.api.create(cardDetails, dispatch))
        .then((newCard) => {
          console.log(newCard);
          const cardId = newCard.id; 
          window.location.href = `/question/${cardId}`;
        })
        .catch(error => {
          console.error('Erro ao criar o card:', error);
        });
  
    } catch (error) {
      console.error('Erro ao gerar o SQL:', error);
    } finally {
      setIsLoading(false); // Retorne o estado de carregamento para falso após a operação
    }
  };

  const isButtonDisabled = !selectedDatabaseId || userQuestion.trim() === '' || isLoading;

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      height: '100%',
    }}>
      <div style={{ margin: '20px', alignSelf: 'start' }}>
        <h2>New Question</h2>
      </div>
      <div style={{
        width: '100%',
        padding: '20px',
        borderTop: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#F9FBFC',
        display: 'flex',
      }}>
        <select
          style={{
            width: '100%',
            backgroundColor: '#F9FBFC',
            border: 'none',
            outline: 'none',
            appearance: 'none', 
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            color: '#333',
          }}
          onChange={(e) => setSelectedDatabaseId(parseInt(e.target.value, 10))}
          value={selectedDatabaseId || ''}
        >
          <option value="" disabled style={{ color: '#ccc' }}>
            Selecione um banco de dados
          </option>
          {databases.map((db) => (
            <option key={db.id} value={db.id}>
              {db.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        style={{
          width: '100%',
          height: '50%',
          padding: '20px',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          marginBottom: '20px',
          backgroundColor: '#F9FBFC',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '1px solid #ccc',
          outline: 'none',
        }}
        placeholder="Digite sua pergunta aqui..."
        value={userQuestion}
        onChange={handleUserQuestionChange}
        rows={4}
      />
      <br/>
      <ButtonRoot onClick={handleSubmitQuestion} purple disabled={isButtonDisabled}>
        {isLoading ? 'Carregando...' : 'Enviar Pergunta'}
      </ButtonRoot>
    </div>
  );
};

export default DatabaseList;
