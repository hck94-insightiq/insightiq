"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AtSign,
  Eye,
  EyeOff,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function Section({
  icon,
  title,
  sublabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-gray-400 dark:text-white/40">{icon}</span>
        <div>
          {sublabel && (
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-white/30 uppercase leading-none mb-0.5">
              // {sublabel}
            </p>
          )}
          <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function Alert({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  const isSuccess = type === "success";
  return (
    <div
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg mt-3 ${
        isSuccess
          ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400"
          : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={14} className="shrink-0" />
      ) : (
        <AlertCircle size={14} className="shrink-0" />
      )}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const accountRef = useRef<HTMLDivElement>(null);
  const passwordRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Your Account", icon: User, ref: accountRef },
    { label: "Change Password", icon: Lock, ref: passwordRef },
    { label: "Danger Zone", icon: Trash2, ref: dangerRef },
  ];

  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [tiktokInput, setTiktokInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // TikTok re-sync state
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokFeedback, setTiktokFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Danger zone state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Seed name from session
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  // Fetch TikTok username from account
  useEffect(() => {
    fetch("/api/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.account?.tiktokUsername) {
          setTiktokUsername(data.account.tiktokUsername);
          setTiktokInput(data.account.tiktokUsername);
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpdateProfile() {
    if (!name.trim()) return;
    setProfileLoading(true);
    setProfileFeedback(null);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");
      await updateSession({ name: name.trim() });
      setProfileFeedback({
        type: "success",
        message: "Nama berhasil diperbarui.",
      });
      // setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setProfileFeedback({ type: "error", message: err.message });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Semua field wajib diisi.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Password baru tidak cocok.",
      });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: "Password minimal 6 karakter.",
      });
      return;
    }
    setPasswordLoading(true);
    setPasswordFeedback(null);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah password.");
      setPasswordFeedback({
        type: "success",
        message: "Password berhasil diubah.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordFeedback({ type: "error", message: err.message });
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleResyncTikTok() {
    if (!tiktokInput.trim()) return;
    setTiktokLoading(true);
    setTiktokFeedback(null);
    try {
      const res = await fetch("/api/tiktok-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tiktokInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal re-sync data TikTok.");
      setTiktokUsername(tiktokInput);
      setTiktokFeedback({
        type: "success",
        message: "Data TikTok berhasil diperbarui.",
      });
    } catch (err: any) {
      setTiktokFeedback({ type: "error", message: err.message });
    } finally {
      setTiktokLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteFeedback(null);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus akun.");
      router.push("/login");
    } catch (err: any) {
      setDeleteFeedback({ type: "error", message: err.message });
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex gap-8 max-w-4xl h-[calc(100vh-7rem)]">
      <nav className="w-48 shrink-0 space-y-1 pt-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() =>
              item.ref.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div ref={accountRef}>
          <Section
            icon={<User size={18} />}
            title="Your Account"
            sublabel="SETTINGS"
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">TikTok profile URL</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Link2
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      value={tiktokInput}
                      onChange={(e) => setTiktokInput(e.target.value)}
                      placeholder="@username atau link TikTok"
                      className="h-10 pl-9"
                    />
                  </div>
                  <Button
                    onClick={handleResyncTikTok}
                    disabled={tiktokLoading || !tiktokInput.trim()}
                    variant="outline"
                    className="h-10 px-4 gap-2 text-sm shrink-0"
                  >
                    {tiktokLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Re-fetch
                  </Button>
                </div>
                {tiktokUsername && (
                  <p className="text-xs text-gray-400 dark:text-white/30">
                    Last fetched:{" "}
                    <span className="font-mono">
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>{" "}
                    · Re-fetch akan trigger AI analysis ulang.
                  </p>
                )}
              </div>

              {(profileFeedback || tiktokFeedback) && (
                <Alert
                  type={(profileFeedback || tiktokFeedback)!.type}
                  message={(profileFeedback || tiktokFeedback)!.message}
                />
              )}

              <Button
                onClick={handleUpdateProfile}
                disabled={
                  profileLoading || !name.trim() || name === session?.user?.name
                }
                className="bg-teal-500 hover:bg-teal-400 text-white h-9 px-5 text-sm font-semibold"
              >
                {profileLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </Section>
        </div>

        <div ref={passwordRef}>
          <Section
            icon={<Lock size={18} />}
            title="Change Password"
            sublabel="SECURITY"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPw" className="text-sm">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPw"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Password saat ini"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPw" className="text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPw"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/60"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPw" className="text-sm">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="h-10"
                />
              </div>

              {passwordFeedback && (
                <Alert
                  type={passwordFeedback.type}
                  message={passwordFeedback.message}
                />
              )}

              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="bg-teal-500 hover:bg-teal-400 text-white h-9 px-5 text-sm font-semibold"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Mengubah...
                  </>
                ) : (
                  "Ubah Password"
                )}
              </Button>
            </div>
          </Section>
        </div>

        <div ref={dangerRef}>
          <Section
            icon={<Trash2 size={18} />}
            title="Danger Zone"
            sublabel="ACCOUNT"
          >
            <p className="text-sm text-gray-500 dark:text-white/40 mb-4">
              Menghapus akun akan menghapus semua data kamu secara permanen —
              profil, data TikTok, dan semua hasil analisis. Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="h-9 px-5 text-sm font-semibold border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300"
            >
              <Trash2 size={14} className="mr-2" />
              Hapus Akun
            </Button>
          </Section>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600">Hapus Akun</DialogTitle>
              <DialogDescription>
                Tindakan ini permanen dan tidak dapat dibatalkan. Semua data
                kamu akan dihapus.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Ketik{" "}
                  <span className="font-mono font-semibold text-red-600">
                    hapus akun saya
                  </span>{" "}
                  untuk konfirmasi
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="hapus akun saya"
                  className="h-10"
                />
              </div>

              {deleteFeedback && (
                <Alert
                  type={deleteFeedback.type}
                  message={deleteFeedback.message}
                />
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeleteConfirmText("");
                  }}
                  className="h-9 px-4 text-sm"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteLoading || deleteConfirmText !== "hapus akun saya"
                  }
                  className="h-9 px-4 text-sm bg-red-600 hover:bg-red-500 text-white font-semibold"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Menghapus...
                    </>
                  ) : (
                    "Hapus Permanen"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
