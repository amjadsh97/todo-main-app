import React, {useEffect, useState, ChangeEvent, KeyboardEvent} from 'react';
// @ts-ignore
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
//   DroppableProvided,
//   DraggableProvided
// } from 'react-beautiful-dnd';

import "./styles/reset.css"
import './styles/App.css';
import iconMoon from "./images/icon-moon.svg";
import iconSun from "./images/icon-sun.svg";
import iconCheck from "./images/icon-check.svg";
import iconCross from "./images/icon-cross.svg"


interface Todo {
  title: string;
  description: string;
  _id: string;
  completed: boolean;
}

function App() {
  const [theme, setTheme] = useState("light")
  const bgDesktop = theme === "light" ? require("./images/bg-desktop-light.jpg") : require("./images/bg-desktop-dark.jpg");
  const bgMobile = theme === "light" ? require("./images/bg-mobile-light.jpg") : require("./images/bg-mobile-dark.jpg");
  const themeIcon = theme === "light" ? iconMoon : iconSun;

  const storedTodos = localStorage.getItem("todos");
  const initialTodos: Todo[] = storedTodos ? JSON.parse(storedTodos) : [];
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState<string>("");
  const [filterTodos, setFilterTodos] = useState<string>("all")
  const nonCompletedTodosCount = todos.filter(todo => !todo.completed).length;
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleAddTodo = (): void => {
    if (!newTodo.trim()) return;

    const newTodoItem: Todo = {title: newTodo, description: "", _id: Date.now().toString(), completed: false};
    setTodos([...todos, newTodoItem]);
    setNewTodo("");
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNewTodo(event.target.value);
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleCompleted = (id: string): void => {
    const updatedTodos = todos.map(todo => {
      if (todo._id === id) {
        return {...todo, completed: !todo.completed};
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string): void => {
    const updatedTodos = todos.filter(todo => todo._id !== id);
    setTodos(updatedTodos);
  }

  const handleRemoveCompletedTodos = (): void => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos)
  }


  const handleDragStart = (e: React.DragEvent<HTMLElement>, index: number) => {
    e.dataTransfer.setData('index', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetIndex: number) => {
    e.preventDefault();
    const startIndex = parseInt(e.dataTransfer.getData('index'));
    const draggedTodo = todos[startIndex];
    const updatedTodos = [...todos];
    updatedTodos.splice(startIndex, 1);
    updatedTodos.splice(targetIndex, 0, draggedTodo);
    setTodos(updatedTodos);
  };
  const handleDragLeave = (): void => {
    setIsDraggingOver(false);
  };

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const todos = document.querySelectorAll<HTMLDivElement>(".todo");
    todos.forEach(todo => {
      if (filterTodos === "all") {
        todo.style.display = ""; // Show all todos
      } else {
        const isActive = todo.classList.contains("active");
        const isCompleted = todo.classList.contains("completed");
        if ((filterTodos === "active" && !isActive) || (filterTodos === "completed" && !isCompleted)) {
          todo.style.display = "none"; // Hide todos based on filter
        } else {
          todo.style.display = ""; // Show todos based on filter
        }
      }
    });
  }, [filterTodos]);

  useEffect(() => {
    // @ts-ignore
    document.querySelector("body").classList.toggle("dark")
  }, [theme])

  useEffect(() => {
    if (window.innerWidth < 768) {
      // @ts-ignore
      document.querySelector(".app-content").append(document.querySelector(".filter-todos"))
    }
  }, [])


  return (
    <div className="app-container">
      <div className="image-wrapper">
        <picture>
          <source srcSet={bgMobile} media="(max-width: 767px)"/>
          <img src={bgDesktop} alt="image desktop"/>
        </picture>

      </div>
      <div className="app-inner-container">
        <div className="app-header">
          <h1 className='app-header-title'>TODO</h1>
          <button className="theme-button" onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}>
            <img src={themeIcon} alt="image theme"/>
          </button>
        </div>
        <div className="app-content">
          <div className="input-container">
            <div className="circle"></div>
            <input
              type="text"
              placeholder='create a new todo...'
              value={newTodo}
              onChange={handleInputChange}
              onKeyPress={handleInputKeyPress}
            />
          </div>
          <div className="todos-container">


            {todos.map((todo: Todo, index) => (
              <div
                key={todo._id}
                className={`todo ${todo.completed ? "completed" : "active"} droppable-area`}
                draggable
                onDragStart={(e: React.DragEvent<HTMLElement>) => handleDragStart(e, index)}
                onDragOver={(e: React.DragEvent<HTMLElement>) => handleDragOver(e)}
                onDrop={(e: React.DragEvent<HTMLElement>) => handleDrop(e, index)}
                onDragLeave={handleDragLeave}
              >
                <div onClick={() => handleCompleted(todo._id)}
                     className={`completed-state ${todo.completed ? 'is-completed' : ''}`}>
                  <img src={iconCheck} alt="icon completion "/>
                </div>

                <p>{todo.title}</p>
                <div onClick={() => handleDeleteTodo(todo._id)} className="delete-action">
                  <img src={iconCross} alt="delete image"/>
                </div>
              </div>
            ))}


            <div className="todos-details">
              <div className="left-todos">{nonCompletedTodosCount} items left</div>
              <div className="filter-todos">
                <button className={`filter-button ${filterTodos === "all" ? "selected" : ""}`}
                        onClick={() => setFilterTodos("all")}>All
                </button>
                <button className={`filter-button ${filterTodos === "active" ? "selected" : ""}`}
                        onClick={() => setFilterTodos("active")}>Active
                </button>
                <button className={`filter-button ${filterTodos === "completed" ? "selected" : ""}`}
                        onClick={() => setFilterTodos("completed")}>Completed
                </button>
              </div>
              <button className="clear-completed" onClick={handleRemoveCompletedTodos}>Clear completed</button>
            </div>
          </div>
        </div>
        <p className='app-hint'>Drag and drop to reorder list</p>
      </div>


    </div>
  );
}

export default App;
