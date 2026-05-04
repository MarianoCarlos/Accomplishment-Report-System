import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, ArrowRightLeft } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.available_roles && user.available_roles.length > 1 && (
                <>
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-normal">
                            Switch View
                        </DropdownMenuLabel>
                        {user.available_roles.filter(role => role !== user.active_role).map(role => (
                            <DropdownMenuItem key={role} asChild>
                                <Link
                                    className="block w-full cursor-pointer"
                                    href="/switch-role"
                                    method="post"
                                    data={{ role: role }}
                                    as="button"
                                    onClick={cleanup}
                                >
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    Switch to {role}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                </>
            )}
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
