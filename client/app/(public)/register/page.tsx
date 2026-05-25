"use client";

import { registerSchema, type RegisterInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    const result = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });
    const json = await result.json();

    if (!result.ok) {
      setServerError(json.error || "Terjadi kesalahan. Coba lagi.");
      return;
    }

    router.push("/login");
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
        <h1 className="text-white text-2xl font-bold">Buat akun baru</h1>
        <p className="text-white/40 text-sm mt-1">
          Mulai analisis TikTok affiliate kamu hari ini
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

        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm" htmlFor="name">
            Nama Lengkap
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Nama kamu"
            autoComplete="name"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-teal-500 h-11"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-red-400 text-xs">{errors.name.message}</p>
          )}
        </div>

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
            placeholder="Min. 6 karakter, 1 huruf kapital, 1 angka"
            autoComplete="new-password"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-teal-500 h-11"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm" htmlFor="confirmPassword">
            Konfirmasi Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-teal-500 h-11"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs">
              {errors.confirmPassword.message}
            </p>
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
              Mendaftar...
            </>
          ) : (
            "Daftar"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-white/30 text-sm mt-6">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
