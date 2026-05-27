import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nama minimal 2 karakter")
      .max(50, "Nama maksimal 50 karakter")
      .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh huruf dan spasi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .max(32, "Password maksimal 32 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const accountSchema = z.object({
  tiktokUsername: z
    .string()
    .min(1, "Username TikTok wajib diisi")
    .max(50, "Username maksimal 50 karakter")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username hanya boleh huruf, angka, titik, dan underscore",
    ),
  followers: z
    .number({ error: "Followers harus berupa angka" })
    .int("Followers harus bilangan bulat")
    .min(0, "Followers tidak boleh negatif")
    .max(100_000_000, "Followers maksimal 100 juta"),
  following: z
    .number({ error: "Following harus berupa angka" })
    .int("Following harus bilangan bulat")
    .min(0, "Following tidak boleh negatif")
    .max(100_000_000, "Following maksimal 100 juta"),
  totalVideos: z
    .number({ error: "Total video harus berupa angka" })
    .int("Total video harus bilangan bulat")
    .min(0, "Total video tidak boleh negatif")
    .max(100_000, "Total video maksimal 100 ribu"),
  avgViews: z
    .number({ error: "Rata-rata views harus berupa angka" })
    .int("Rata-rata views harus bilangan bulat")
    .min(0, "Rata-rata views tidak boleh negatif")
    .max(100_000_000, "Rata-rata views maksimal 100 juta"),
  avgLikes: z
    .number({ error: "Rata-rata likes harus berupa angka" })
    .int("Rata-rata likes harus bilangan bulat")
    .min(0, "Rata-rata likes tidak boleh negatif")
    .max(100_000_000, "Rata-rata likes maksimal 100 juta"),
  avgComments: z
    .number({ error: "Rata-rata komentar harus berupa angka" })
    .int("Rata-rata komentar harus bilangan bulat")
    .min(0, "Rata-rata komentar tidak boleh negatif")
    .max(10_000_000, "Rata-rata komentar maksimal 10 juta"),
  avgShares: z
    .number({ error: "Rata-rata shares harus berupa angka" })
    .int("Rata-rata shares harus bilangan bulat")
    .min(0, "Rata-rata shares tidak boleh negatif")
    .max(10_000_000, "Rata-rata shares maksimal 10 juta"),
  primaryNiche: z.enum(
    [
      "lifestyle",
      "fashion",
      "beauty",
      "food",
      "tech",
      "fitness",
      "education",
      "entertainment",
      "other",
    ],
    { error: "Niche tidak valid" },
  ),
  hashtags: z
    .array(
      z
        .string()
        .min(1, "Hashtag tidak boleh kosong")
        .regex(/^#?[a-zA-Z0-9_]+$/, "Format hashtag tidak valid"),
    )
    .min(1, "Minimal 1 hashtag wajib diisi")
    .max(10, "Maksimal 10 hashtag"),
  contentDescription: z
    .string()
    .min(10, "Deskripsi konten minimal 10 karakter")
    .max(300, "Deskripsi konten maksimal 300 karakter"),
  priceRange: z
    .object({
      min: z
        .number({ error: "Harga minimum harus berupa angka" })
        .int("Harga minimum harus bilangan bulat")
        .min(0, "Harga minimum tidak boleh negatif"),
      max: z
        .number({ error: "Harga maksimum harus berupa angka" })
        .int("Harga maksimum harus bilangan bulat")
        .min(0, "Harga maksimum tidak boleh negatif"),
    })
    .refine((data) => data.max >= data.min, {
      message: "Harga maksimum tidak boleh kurang dari harga minimum",
      path: ["max"],
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AccountInput = z.infer<typeof accountSchema>;
