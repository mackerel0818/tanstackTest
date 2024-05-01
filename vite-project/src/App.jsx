import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

const url = "http://localhost:5000/todos";

const performFetch = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchTodos = () => {
  return performFetch(url, {});
};

const createTodo = (newTodo) => {
  return performFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newTodo),
  });
};

const updateTodo = ({ id, ...updateInfos }) => {
  return performFetch(`${url}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateInfos),
  });
};

const deleteTodo = (id) => {
  return performFetch(`${url}/${id}`, {
    method: "DELETE",
  });
};

function App() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [editTodoValue, setEditTodoValue] = useState("");

  const {
    data: todos,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const onMutateSuccess = (additionalActions) => () => {
    queryClient.invalidateQueries(["todos"]);
    if (additionalActions) additionalActions();
  };

  const addTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: onMutateSuccess(),
  });

  const updateTodoMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: onMutateSuccess(() => setIsEditing(null)),
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: onMutateSuccess(),
  });

  const handleAddTodo = () => {
    addTodoMutation.mutate({ title: newTodo });
    setNewTodo("");
  };

  const handleDeleteTodo = (id) => {
    deleteTodoMutation.mutate(id);
  };

  const handleEditTodo = (id, title) => {
    setIsEditing(id);
    setEditTodoValue(title);
  };

  const handleSaveEdit = (id) => {
    updateTodoMutation.mutate({ id, title: editTodoValue });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <h1>Todos</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add new todo"
      />
      <button onClick={handleAddTodo}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {isEditing === todo.id ? (
              <>
                <input
                  type="text"
                  value={editTodoValue}
                  onChange={(e) => setEditTodoValue(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(todo.id)}>Save</button>
              </>
            ) : (
              <>
                {todo.title}
                <button onClick={() => handleEditTodo(todo.id, todo.title)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteTodo(todo.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
