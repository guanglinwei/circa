import { Link } from 'react-router-dom';
import temp from '@/assets/templogo.jpg';

export default function Header() {
  return (
    <header className="absolute top-0 right-0 p-4 z-50">
      <Link to="/account">
        <button className="cursor-pointer rounded-full overflow-hidden w-10 h-10 hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-ring transition">
          <img
            src={temp} // change this to your avatar path
            alt="Account"
            className="w-full h-full object-cover"
          />
        </button>
      </Link>
    </header>
  );
}