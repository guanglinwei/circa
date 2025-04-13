import { Link } from 'react-router-dom';
import temp from '@/assets/templogo.jpg';

export default function Header() {
  return (
    <header className="absolute top-0 right-0 p-4 z-50">
      <Link to="/account">
        <button className="rounded-full overflow-hidden w-10 h-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition">
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