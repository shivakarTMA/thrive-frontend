import { Link } from "react-router-dom";

const ItemsList = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} className="w-full">
          <Link to="#" className="border-b py-2 w-full block">{item.firstName}</Link>
        </li>
      ))}
    </ul>
  );
};

export default ItemsList;
