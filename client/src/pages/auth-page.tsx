import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { insertUserSchema } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration schema extends insertUserSchema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Setup form for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Setup form for registration
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      avatarUrl: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(data);
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(data);
      navigate('/');
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          {/* Form Section */}
          <div className="w-full md:w-1/2 p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">
              {activeTab === 'login' ? 'Welcome Back' : 'Join Cinevia'}
            </h1>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-username" className="block">
                      Username or Email
                    </label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username or email"
                      {...loginForm.register('username')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-red-500 text-sm">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="block">
                      Password
                    </label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      {...loginForm.register('password')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="register-username" className="block">
                      Username
                    </label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      {...registerForm.register('username')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-sm">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-email" className="block">
                      Email
                    </label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      {...registerForm.register('email')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="block">
                      Password
                    </label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      {...registerForm.register('password')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="register-confirm-password" className="block">
                      Confirm Password
                    </label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      {...registerForm.register('confirmPassword')}
                      className="w-full bg-gray-700 rounded px-4 py-2 border border-gray-600 focus:border-primary focus:outline-none"
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Section */}
          <div className="hidden md:block md:w-1/2 relative">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/90 via-gray-800/50 to-gray-800/20"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="p-12">
                <h2 className="text-4xl font-bold mb-4">Your Personal Film Buddy</h2>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Browse a vast collection of movies and TV shows.
                  </li>
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Track movies you've watched and add to your favorites.
                  </li>
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Rate and review films. Connect with other members.
                  </li>
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Add films to your watchlists and create custom lists.
                  </li>
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Log everything  you've watched in your diary.
            
                  </li>
                  <li className="flex items-center">
                    <svg className="h-6 w-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Get personalized recommendations.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


















