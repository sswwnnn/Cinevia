import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <header className="bg-tmdb-dark">
      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold mr-2">Cine<span className="text-primary">via</span></span>
            </Link>
            
            {/* Main Nav - Desktop */}
            <nav className="hidden md:flex ml-6">
              <ul className="flex space-x-6">
                <li className="group relative">
                  <Link href="/movies" className={`font-semibold pb-3 border-b-2 ${isActive('/movies') ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors`}>
                    Movies
                  </Link>
                  <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg hidden group-hover:block z-10">
                    <div className="py-1">
                      <Link href="/movies/popular" className="block px-4 py-2 hover:bg-gray-700">Popular</Link>
                      <Link href="/movies/now-playing" className="block px-4 py-2 hover:bg-gray-700">Now Playing</Link>
                      <Link href="/movies/upcoming" className="block px-4 py-2 hover:bg-gray-700">Upcoming</Link>
                      <Link href="/movies/top-rated" className="block px-4 py-2 hover:bg-gray-700">Top Rated</Link>
                    </div>
                  </div>
                </li>
                <li className="group relative">
                  <Link href="/tv" className={`font-semibold pb-3 border-b-2 ${isActive('/tv') ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors`}>
                    TV Shows
                  </Link>
                  <div className="absolute left-0 mt-1 w-48 bg-gray-800 rounded-md shadow-lg hidden group-hover:block z-10">
                    <div className="py-1">
                      <Link href="/tv/popular" className="block px-4 py-2 hover:bg-gray-700">Popular</Link>
                      <Link href="/tv/airing-today" className="block px-4 py-2 hover:bg-gray-700">Airing Today</Link>
                      <Link href="/tv/on-tv" className="block px-4 py-2 hover:bg-gray-700">On TV</Link>
                      <Link href="/tv/top-rated" className="block px-4 py-2 hover:bg-gray-700">Top Rated</Link>
                    </div>
                  </div>
                </li>
                <li>
                  <Link href="/people" className={`font-semibold pb-3 border-b-2 ${isActive('/people') ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors`}>
                    People
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link href="/for-you" className={`font-semibold pb-3 border-b-2 ${isActive('/for-you') ? 'border-primary' : 'border-transparent'} hover:border-primary transition-colors`}>
                      For You
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          
          {/* Right Side Navigation */}
          <div className="flex items-center">
            <div className="flex items-center">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger className="text-white bg-transparent p-2 rounded-full">
                  <span className="bg-gray-800 px-2 py-1 rounded text-sm font-medium flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    EN
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Español</DropdownMenuItem>
                  <DropdownMenuItem>Français</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu Button */}
              <div className="md:hidden ml-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-gray-800">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                          <span className="text-2xl font-bold">Cine<span className="text-primary">via</span></span>
                        </Link>
                      </div>
                      <nav className="flex flex-col gap-4">
                        <SheetClose asChild>
                          <Link href="/movies" className="font-semibold hover:text-primary">Movies</Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/tv" className="font-semibold hover:text-primary">TV Shows</Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/people" className="font-semibold hover:text-primary">People</Link>
                        </SheetClose>
                        {user && (
                          <SheetClose asChild>
                            <Link href="/for-you" className="font-semibold hover:text-primary">For You</Link>
                          </SheetClose>
                        )}
                      </nav>
                      {user ? (
                        <div className="border-t border-gray-700 pt-4">
                          <SheetClose asChild>
                            <Link href={`/profile/${user.username}`} className="font-semibold hover:text-primary">Your Profile</Link>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start pl-0 text-primary mt-2">
                              Logout
                            </Button>
                          </SheetClose>
                        </div>
                      ) : (
                        <div className="border-t border-gray-700 pt-4">
                          <SheetClose asChild>
                            <Link href="/auth" className="font-semibold hover:text-primary">Login / Join</Link>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              {/* Login/Join/User Menu */}
              <div className="hidden md:block ml-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.username}`}>View Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-primary">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex space-x-2">
                    <Link href="/auth" className="font-medium hover:text-primary">Login</Link>
                    <span>|</span>
                    <Link href="/auth?tab=register" className="font-medium hover:text-primary">Join Cinevia</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-gray-900 py-3">
        <div className="container mx-auto px-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Header;
