import { useStore } from "../../../store/StoreContext";
import toast from "react-hot-toast";

export function useFavorites() {
  const { state, dispatch } = useStore();

  const toggle = (id: string, title: string) => {
    const alreadySaved = state.saved.includes(id);

    dispatch({
      type: "TOGGLE_FAVORITE",
      payload: id,
    });

    if (alreadySaved) {
      toast("Removed: " + title);
    } else {
      toast.success("Saved: " + title);
    }
  };

  const isSaved = (id: string): boolean => {
    return state.saved.includes(id);
  };

  const count = state.saved.length;

  return {
    toggle,
    isSaved,
    count,
  };
}
