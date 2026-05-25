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
      {/* Mobile logo — hanya muncul di layar kecil */}
      <div className="flex items-center gap-2 mb-6 lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs">IQ</span>
        </div>
        <span className="text-white font-semibold tracking-tight">
          InsightIQ
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Selamat datang kembali</h1>
        <p className="text-white/40 text-sm mt-1">
          Masuk untuk melihat insight akun TikTok kamu
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Server error */}
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{serverError}</p>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="kamu@email.com"
            autoComplete="email"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-teal-500 h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-400 text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-teal-500 h-11"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-white font-semibold mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Masuk...
            </>
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-white/30 text-sm mt-6">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
