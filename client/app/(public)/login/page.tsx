"use client";

import { type LoginInput, loginSchema } from "@/lib/validators";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setServerError("Email atau password salah.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
            <span className="text-white text-lg font-semibold tracking-tight">
              InsightIQ
            </span>
          </div>
          <h1 className="text-white text-2xl font-bold">
            Selamat datang kembali
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Silakan masuk ke akun Anda
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* serverError */}
          {serverError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}
          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Masukkan email Anda"
              className="bg-white/10 border border-white/20 placeholder:text-white/40 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-white text-sm" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              className="bg-white/10 border border-white/20 placeholder:text-white/40 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            Masuk
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin ml-2" size={16} />
                Masuk...
              </>
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-white/40 text-sm mt-6 text-center">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
