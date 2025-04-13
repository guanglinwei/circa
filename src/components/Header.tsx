import logo from '@/assets/logo.png';

interface HeaderProps {
    onAvatarClick: () => void;
  }
  
  export default function Header({ onAvatarClick }: HeaderProps) {
    return (
      <header className="absolute top-0 right-0 p-4 z-50">
        <button
          onClick={onAvatarClick}
          className="cursor-pointer rounded-full overflow-hidden w-10 h-10 hover:outline-none hover:ring-2 hover:ring-offset-2 hover:ring-ring transition"
        >
          <img
            src={logo}
            alt="Account"
            className="w-full h-full object-cover"
          />
        </button>
      </header>
    );
  }
  