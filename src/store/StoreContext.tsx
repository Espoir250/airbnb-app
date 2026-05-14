// src/store/StoreContext.tsx

import { createContext, useContext, useReducer } from "react";
import type { Dispatch, ReactNode } from "react";

import type { State, Action } from "./types"; // ← full types from store/types.ts

// ---- INITIAL STATE ----

const initialState: State = {
  listings: [],
  loading: true,
  filter: "",
  saved: [],
  user: null, // ✅ ADD THIS
};

// ---- REDUCER ----

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LISTINGS":
      return { ...state, listings: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "TOGGLE_FAVORITE": {
      const isSaved = state.saved.includes(action.payload);
      return {
        ...state,
        saved: isSaved
          ? state.saved.filter((id) => id !== action.payload)
          : [...state.saved, action.payload],
      };
    }

    default:
      return state;
  }
}

// ---- CONTEXT ----

interface StoreContextType {
  state: State;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// ---- PROVIDER ----

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// ---- HOOK ----

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  return context;
}