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

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      color: "#333",
      backgroundColor: "#f4f4f4",
      padding: "20px",
      borderRadius: "5px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    input: {
      width: "75%",
      padding: "10px",
      margin: "15px 10px 0",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    wrap: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "15px",
      border: "none",
      cursor: "pointer",
      backgroundColor: "#555",
      color: "white",
      marginLeft: "5px",
    },
    listItem: {
      listStyle: "none",
      margin: "20px 0",
      backgroundColor: "#fff",
      padding: "10px",
      borderRadius: "5px",
    },
    todoText: {
      marginRight: "10px",
    },
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div style={styles.container}>
      <h1>My Simple Todolist</h1>
      <input
        style={styles.input}
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add new todo"
      />
      <button style={styles.button} onClick={handleAddTodo}>
        Add Todo
      </button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} style={styles.listItem}>
            {isEditing === todo.id ? (
              <>
                <input
                  style={styles.input}
                  type="text"
                  value={editTodoValue}
                  onChange={(e) => setEditTodoValue(e.target.value)}
                />
                <button
                  style={styles.button}
                  onClick={() => handleSaveEdit(todo.id)}
                >
                  Save
                </button>
              </>
            ) : (
              <div style={styles.wrap}>
                <span style={styles.todoText}>{todo.title}</span>
                <div style={styles.wrapBtn}>
                  <button
                    style={styles.button}
                    onClick={() => handleEditTodo(todo.id, todo.title)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.button}
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
