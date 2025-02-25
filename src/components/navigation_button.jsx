import { useHistory } from "react-router-dom";

export default function NavigationButton({ target, text }) {
  const history = useHistory();

  function handleClick() {
    history.push(`${target}`);
  }

  return (
    <button type="button" className="btn btn-outline-secondary" onClick={handleClick}>
      { text }
    </button>
  );
}

