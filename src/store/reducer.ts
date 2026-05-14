// src/store/reducer.ts

import type { State, Action } from "./types";

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LISTINGS":
      return {
        ...state,
        listings: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_FILTER":
      return {
        ...state,
        filter: action.payload,
      };

    case "TOGGLE_FAVORITE": {
      const id = action.payload;

      const isAlreadySaved = state.saved.includes(id);

      return {
        ...state,
        saved: isAlreadySaved
          ? state.saved.filter((item) => item !== id)
          : [...state.saved, id],
      };
    }

    default:
      return state;
  }
}