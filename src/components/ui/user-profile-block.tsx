import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfileBlockProps {
  avatar?: string;
  name?: string;
  username?: string;
  onClick?: () => void;
  className?: string;
}

export const UserProfileBlock = ({
  avatar,
  name,
  username,
  onClick,
  className = '',
}: UserProfileBlockProps) => {
  const getInitials = (
    displayName: string | undefined,
    usernameStr: string | undefined,
  ) => {
    const text = displayName || usernameStr || 'U';
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`px-2 py-2 flex items-center gap-2 rounded-md transition-colors mx-1 mt-1 ${
        onClick ? 'cursor-pointer hover:bg-zinc-800/50' : ''
      } ${className}`}
      onClick={onClick}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={avatar} alt={name || username} />
        <AvatarFallback className="bg-zinc-800 text-zinc-300 font-medium text-xs">
          {getInitials(name, username)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <p className="text-sm font-medium text-zinc-200 truncate leading-tight">
          {name || username || 'User'}
        </p>
        {username && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">@{username}</p>
        )}
      </div>
    </div>
  );
};
