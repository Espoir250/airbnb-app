import { _ } from "numeral";

type Prop = {
    count: number;
};

export function SavedBadge({ count }: Prop) {
    if (count === 0) return null;

    return (
        <span className= "saved-badge">
            {count} {count === 1 ? "saved" : "saved"}
        </span>
    )
}