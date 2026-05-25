// app/(app)/onboarding/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { accountSchema } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

type FormData = z.infer<typeof accountSchema>;

const NICHES = [
  "lifestyle",
  "fashion",
  "beauty",
  "food",
  "tech",
  "fitness",
  "education",
  "entertainment",
  "other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      tiktokUsername: "",
      followers: 0,
      following: 0,
      totalVideos: 0,
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgShares: 0,
      primaryNiche: "lifestyle",
      hashtags: [],
      contentDescription: "",
      priceRange: { min: 50000, max: 200000 },
    },
  });

  const hashtags = watch("hashtags");
  const contentDescription = watch("contentDescription");

  function addHashtag() {
    const cleaned = hashtagInput.trim().replace(/^#/, "");
    if (!cleaned || hashtags.includes(cleaned) || hashtags.length >= 10) return;
    setValue("hashtags", [...hashtags, cleaned]);
    setHashtagInput("");
  }

  function removeHashtag(tag: string) {
    setValue(
      "hashtags",
      hashtags.filter((h) => h !== tag),
    );
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Data tersimpan! Menjalankan AI analysis...");
      await fetch("/api/analysis", { method: "POST" });
      router.push("/dashboard");
    } catch (err) {
      toast.error("Gagal menyimpan data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Setup Akun TikTok Kamu</CardTitle>
          <CardDescription>
            Isi data akun TikTok kamu untuk dapat analisis AI dan rekomendasi
            produk yang relevan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label>Username TikTok</Label>
              <Input
                placeholder="@bima_lifestyle"
                {...register("tiktokUsername")}
              />
              {errors.tiktokUsername && (
                <p className="text-sm text-destructive">
                  {errors.tiktokUsername.message}
                </p>
              )}
            </div>

            {/* Followers & Following */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Followers</Label>
                <Input
                  type="number"
                  {...register("followers", { valueAsNumber: true })}
                />
                {errors.followers && (
                  <p className="text-sm text-destructive">
                    {errors.followers.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Following</Label>
                <Input
                  type="number"
                  {...register("following", { valueAsNumber: true })}
                />
                {errors.following && (
                  <p className="text-sm text-destructive">
                    {errors.following.message}
                  </p>
                )}
              </div>
            </div>

            {/* Total Videos & Avg Views */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Video</Label>
                <Input
                  type="number"
                  {...register("totalVideos", { valueAsNumber: true })}
                />
                {errors.totalVideos && (
                  <p className="text-sm text-destructive">
                    {errors.totalVideos.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rata-rata Views per Video</Label>
                <Input
                  type="number"
                  {...register("avgViews", { valueAsNumber: true })}
                />
                {errors.avgViews && (
                  <p className="text-sm text-destructive">
                    {errors.avgViews.message}
                  </p>
                )}
              </div>
            </div>

            {/* Avg Likes, Comments, Shares */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Rata-rata Likes</Label>
                <Input
                  type="number"
                  {...register("avgLikes", { valueAsNumber: true })}
                />
                {errors.avgLikes && (
                  <p className="text-sm text-destructive">
                    {errors.avgLikes.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rata-rata Comments</Label>
                <Input
                  type="number"
                  {...register("avgComments", { valueAsNumber: true })}
                />
                {errors.avgComments && (
                  <p className="text-sm text-destructive">
                    {errors.avgComments.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rata-rata Shares</Label>
                <Input
                  type="number"
                  {...register("avgShares", { valueAsNumber: true })}
                />
                {errors.avgShares && (
                  <p className="text-sm text-destructive">
                    {errors.avgShares.message}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Niche */}
            <div className="space-y-2">
              <Label>Niche Utama</Label>
              <Select
                onValueChange={(val) =>
                  setValue("primaryNiche", val as FormData["primaryNiche"])
                }
                defaultValue="lifestyle"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih niche" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.primaryNiche && (
                <p className="text-sm text-destructive">
                  {errors.primaryNiche.message}
                </p>
              )}
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label>Hashtag Favorit (maks 10)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="ootd"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                />
                <Button type="button" onClick={addHashtag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="px-3 py-1 bg-secondary rounded-full text-sm hover:bg-destructive hover:text-destructive-foreground transition"
                  >
                    #{tag} ✕
                  </button>
                ))}
              </div>
              {errors.hashtags && (
                <p className="text-sm text-destructive">
                  {errors.hashtags.message}
                </p>
              )}
            </div>

            {/* Content Description */}
            <div className="space-y-2">
              <Label>Deskripsi Konten (maks 300 karakter)</Label>
              <Textarea
                placeholder="Konten tentang gaya hidup minimalis dan outfit harian mahasiswa..."
                maxLength={300}
                rows={4}
                {...register("contentDescription")}
              />
              <p className="text-xs text-muted-foreground">
                {contentDescription?.length ?? 0}/300
              </p>
              {errors.contentDescription && (
                <p className="text-sm text-destructive">
                  {errors.contentDescription.message}
                </p>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Rentang Harga Produk Nyaman Dipromosikan (Rp)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    {...register("priceRange.min", { valueAsNumber: true })}
                  />
                  {errors.priceRange?.min && (
                    <p className="text-sm text-destructive">
                      {errors.priceRange.min.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Max"
                    {...register("priceRange.max", { valueAsNumber: true })}
                  />
                  {errors.priceRange?.max && (
                    <p className="text-sm text-destructive">
                      {errors.priceRange.max.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? "Memproses..." : "Simpan & Analisis AI"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
