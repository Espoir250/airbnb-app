// src/store/types.ts

import type { Listing } from "../features/listings/types";

/**
 * User type
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Global application state
 */
export interface State {
  listings: Listing[];
  loading: boolean;
  filter: string;
  saved: string[];
  user: User | null; // ✅ added correctly
}

/**
 * Discriminated union of all possible actions
 */
export type Action =
  | {
      type: "SET_LISTINGS";
      payload: Listing[];
    }
  | {
      type: "SET_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_FILTER";
      payload: string;
    }
  | {
      type: "TOGGLE_FAVORITE";
      payload: string;
    }
  | {
      type: "SET_USER";
      payload: User | null;
    };
