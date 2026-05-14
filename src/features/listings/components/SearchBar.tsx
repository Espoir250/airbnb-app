import { useEffect, useRef, useState } from "react";
import { useStore } from "../../../store/StoreContext";
import debounce from "lodash/debounce";

export function SearchBar() {
  const { dispatch } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // local state to control input instantly
  const [value, setValue] = useState("");

  // debounced dispatch (300ms)
  const debouncedDispatch = useRef(
    debounce((val: string) => {
      dispatch({ type: "SET_FILTER", payload: val });
    }, 300)
  ).current;

  // handle typing
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    debouncedDispatch(val);
  };

  // auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      className="search-bar"
      placeholder="Search listings..."
      value={value}
      onChange={handleChange}
    />
  );
}
