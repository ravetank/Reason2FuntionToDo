import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const List = () => {
  const [lists, setLists] =useState([]);
  const {listId} = useparams();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await axiosget('api/lists');
        setLists(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLists();
  }, []);

  const handleCreateList = async (Title) => {
    try {
      const response = await axios.post('api/lists', { title });
      setlists([...lists, response.data]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="list">
      <button onClick={() => handleCreateList('New List')}>Create New List</button>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>
            <Link to={`/cards/${list.id}`}>{list.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default List;