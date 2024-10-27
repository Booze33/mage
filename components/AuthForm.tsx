'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { register, signIn, getLoggedInUser } from '@/lib/actions/user.action';

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getLoggedInUser();
        if (userData) {
          setUser(userData);
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch logged-in user:', error);
      }
    };

    fetchUser();
  }, [router]);

  const formSchema = authFormSchema(type)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      profile_pic: null,
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      if(type === 'register') {
        const file = (data.profile_pic as FileList)?.[0] || null;
        const userData = {
          name: data.name!,
          email: data.email,
          password: data.password,
          profile_pic: file,
        }

        const newUser = await register(userData);
        if(newUser) router.push('/');
      }

      if(type === 'signin') {
        const userData = {
          email: data.email,
          password: data.password,
        }

        const signInResult = await signIn(userData);
        if(signInResult) router.push('/');
      }
    } catch (error) {
      console.error(`Error during ${type}:`, error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="w-[100vw] h-[100vh] bg-slate-100 flex flex-col justify-center items-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[80vw] sm:w-[40vw] rounded shadow-md shadow-slate-950 p-12 bg-[#fff]">
          {type === 'register' && (
            <CustomInput control={form.control} name='name' label="Full Name" placeholder='Enter your full name' />
          )}

          <CustomInput control={form.control} name='email' label="Email" placeholder='Enter your email' />
          <CustomInput control={form.control} name='password' label="Password" placeholder='Enter your password' />

          {error && <p className="text-red-500 mt-2">{error}</p>}

          {type === 'register' && (
            <CustomInput
              control={form.control}
              name="profile_pic"
              label="your profile pic"
              isDropdown
              type="file"
            />
          )}

          <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : (type === 'signin' ? 'Sign In' : 'Register')}
          </Button>
        </form>
      </Form>

      <footer className="flex justify-center gap-1 mt-4">
        <p className="text-14 font-normal text-gray-600">
          {type === 'signin'
          ? "Don't have an account?"
          : "Already have an account?"}
        </p>
        <Link href={type === 'signin' ? '/signup' : '/signin'} className="form-link">
          {type === 'signin' ? 'Register' : 'Sign in'}
        </Link>
      </footer>
    </main>
  );
};

export default AuthForm;