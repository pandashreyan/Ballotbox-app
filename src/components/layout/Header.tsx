
'use client';

import Link from 'next/link';
import { VoteIcon, UserCircle, LogOut, UserCog, UserCheck, Users, Loader2, LogIn, Users2, Edit } from 'lucide-react'; // Added Users2, Edit
import { useAuth, UserRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation'; // Import useRouter


export function Header() {
  const { user, isLoadingAuth } = useAuth();
  const router = useRouter(); // Initialize useRouter

  const handleRoleChange = (newRole: UserRole | 'logout') => {
    if (typeof window !== 'undefined' && (window as any).setMockUserRole) {
      if (newRole === 'logout') {
        (window as any).setMockUserRole(null);
        router.push('/'); // Navigate to homepage on logout
      } else {
        (window as any).setMockUserRole(newRole);
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === null) return <UserCircle className="mr-2 h-4 w-4" />;
    switch (role) {
      case 'admin':
        return <UserCog className="mr-2 h-4 w-4" />;
      case 'candidate':
        return <UserCheck className="mr-2 h-4 w-4" />;
      case 'voter':
        return <Users className="mr-2 h-4 w-4" />;
      default:
        return <UserCircle className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold hover:opacity-90 transition-opacity">
          <VoteIcon className="h-8 w-8" />
          BallotBox
        </Link>
        <div className="flex items-center gap-4">
          {isLoadingAuth ? (
            <Button variant="ghost" className="flex items-center text-sm" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading User...
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm hover:bg-primary/80 focus-visible:ring-offset-primary focus-visible:ring-primary-foreground">
                  {getRoleIcon(user.role)}
                  Logged in as: {user.name} ({user.role})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                 {user.role === 'admin' && (
                  <>
                    <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push('/admin/candidates')}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Candidate Approval</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => router.push('/admin/voters')}>
                      <Users2 className="mr-2 h-4 w-4" />
                      <span>Voter Management</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel>Switch Mock Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Admin</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('candidate')}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Candidate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('voter')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Voter</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRoleChange('logout')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out (Guest)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" className="flex items-center text-sm hover:bg-primary/80 focus-visible:ring-offset-primary focus-visible:ring-primary-foreground">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
           <p className="text-xs text-primary-foreground/70 hidden md:block">
            (Mock Auth: Change role for testing)
          </p>
        </div>
      </div>
    </header>
  );
}
