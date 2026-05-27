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
  Eye,
  EyeOff,
  Link2,
  Bell,
  Send,
  Copy,
  Check,
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
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-muted-foreground">{icon}</span>
        <div>
          {sublabel && (
            <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase leading-none mb-0.5">
              // {sublabel}
            </p>
          )}
          <h2 className="text-base font-semibold text-foreground leading-tight">
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
          ? "bg-teal-500/10 text-teal-700 dark:text-teal-400"
          : "bg-red-500/10 text-red-700 dark:text-red-400"
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
  const notifRef = useRef<HTMLDivElement>(null);
  const dangerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Your Account", icon: User, ref: accountRef },
    { label: "Change Password", icon: Lock, ref: passwordRef },
    { label: "Notifikasi Telegram", icon: Bell, ref: notifRef },
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

  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokFeedback, setTiktokFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [tgConnected, setTgConnected] = useState(false);
  const [tgNotifEnabled, setTgNotifEnabled] = useState(false);
  const [tgNotifHour, setTgNotifHour] = useState(5);
  const [tgVerifyCode, setTgVerifyCode] = useState<string | null>(null);
  const [tgBotUsername, setTgBotUsername] = useState("InsightIQ_Bot");
  const [tgCodeCopied, setTgCodeCopied] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgCheckLoading, setTgCheckLoading] = useState(false);
  const [tgTestLoading, setTgTestLoading] = useState(false);
  const [tgDisconnectLoading, setTgDisconnectLoading] = useState(false);
  const [tgFeedback, setTgFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

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

  useEffect(() => {
    fetch("/api/telegram/status")
      .then((r) => r.json())
      .then((data) => {
        setTgConnected(data.connected ?? false);
        setTgNotifEnabled(data.notificationEnabled ?? false);
        setTgNotifHour(data.notificationHour ?? 5);
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
      const fetchRes = await fetch("/api/tiktok-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tiktokInput }),
      });
      const fetchData = await fetchRes.json();
      if (!fetchRes.ok)
        throw new Error(fetchData.error || "Gagal fetch data TikTok.");
      setTiktokUsername(tiktokInput);
      await fetch("/api/analysis", { method: "DELETE" });
      const analysisRes = await fetch("/api/analysis", { method: "POST" });
      if (!analysisRes.ok) throw new Error("Gagal menjalankan AI analysis.");
      setTiktokFeedback({
        type: "success",
        message: "Data TikTok dan AI analysis berhasil diperbarui.",
      });
    } catch (err: any) {
      setTiktokFeedback({ type: "error", message: err.message });
    } finally {
      setTiktokLoading(false);
    }
  }

  async function handleGenerateTgCode() {
    setTgLoading(true);
    setTgFeedback(null);
    try {
      const res = await fetch("/api/telegram/generate-code", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate kode.");
      setTgVerifyCode(data.code);
      setTgBotUsername(data.botUsername);
    } catch (err: any) {
      setTgFeedback({ type: "error", message: err.message });
    } finally {
      setTgLoading(false);
    }
  }

  async function handleCheckTgStatus() {
    setTgCheckLoading(true);
    setTgFeedback(null);
    try {
      const res = await fetch("/api/telegram/status");
      const data = await res.json();
      setTgConnected(data.connected ?? false);
      setTgNotifEnabled(data.notificationEnabled ?? false);
      setTgNotifHour(data.notificationHour ?? 5);
      if (data.connected) {
        setTgVerifyCode(null);
        setTgFeedback({
          type: "success",
          message: "Telegram berhasil terhubung!",
        });
      } else {
        setTgFeedback({
          type: "error",
          message:
            "Telegram belum terhubung. Pastikan sudah kirim kode ke bot.",
        });
      }
    } catch {
      setTgFeedback({ type: "error", message: "Gagal cek status." });
    } finally {
      setTgCheckLoading(false);
    }
  }

  async function handleTgNotifToggle(enabled: boolean) {
    setTgNotifEnabled(enabled);
    await fetch("/api/telegram/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationEnabled: enabled }),
    });
  }

  async function handleTgHourChange(hour: number) {
    setTgNotifHour(hour);
    await fetch("/api/telegram/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationHour: hour }),
    });
  }

  async function handleTgTest() {
    setTgTestLoading(true);
    setTgFeedback(null);
    try {
      const res = await fetch("/api/telegram/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal kirim pesan tes.");
      setTgFeedback({
        type: "success",
        message: "Pesan tes berhasil dikirim ke Telegram kamu!",
      });
    } catch (err: any) {
      setTgFeedback({ type: "error", message: err.message });
    } finally {
      setTgTestLoading(false);
    }
  }

  async function handleTgDisconnect() {
    setTgDisconnectLoading(true);
    setTgFeedback(null);
    try {
      const res = await fetch("/api/telegram/disconnect", { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal memutus koneksi.");
      setTgConnected(false);
      setTgNotifEnabled(false);
      setTgVerifyCode(null);
      setTgFeedback({ type: "success", message: "Telegram berhasil diputus." });
    } catch (err: any) {
      setTgFeedback({ type: "error", message: err.message });
    } finally {
      setTgDisconnectLoading(false);
    }
  }

  function handleCopyCode() {
    if (!tgVerifyCode) return;
    navigator.clipboard.writeText(`/start ${tgVerifyCode}`);
    setTgCodeCopied(true);
    setTimeout(() => setTgCodeCopied(false), 2000);
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
    <div className="flex gap-8 max-w-4xl h-[calc(100vh-7rem)] -mb-16">
      {/* Side nav */}
      <nav className="w-48 shrink-0 space-y-1 pt-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() =>
              item.ref.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <item.icon size={15} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-w-0 space-y-6 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {/* Your Account */}
        <div ref={accountRef}>
          <Section icon={<User size={18} />} title="Your Account">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                    Re-analyze
                  </Button>
                </div>
                {tiktokUsername && (
                  <p className="text-xs text-muted-foreground">
                    Last fetched:{" "}
                    <span className="font-mono">
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>{" "}
                    · Re-analyze akan trigger AI analysis ulang.
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

        {/* Change Password */}
        <div ref={passwordRef}>
          <Section icon={<Lock size={18} />} title="Change Password">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Notifikasi Telegram */}
        <div ref={notifRef}>
          <Section icon={<Bell size={18} />} title="Notifikasi Telegram">
            {!tgConnected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hubungkan Telegram kamu untuk menerima rekomendasi produk
                  harian berdasarkan niche TikTok-mu.
                </p>

                {!tgVerifyCode ? (
                  <Button
                    onClick={handleGenerateTgCode}
                    disabled={tgLoading}
                    className="h-9 px-5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white gap-2"
                  >
                    {tgLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    Hubungkan Telegram
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted border border-border rounded-lg p-4 space-y-3">
                      <p className="text-sm font-medium text-foreground">
                        Ikuti langkah berikut:
                      </p>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>
                          Buka Telegram dan cari{" "}
                          <span className="font-mono font-semibold text-foreground">
                            @{tgBotUsername}
                          </span>
                        </li>
                        <li>Kirim pesan berikut ke bot:</li>
                      </ol>
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-4 py-3">
                        <code className="flex-1 font-mono text-sm text-teal-600 dark:text-teal-400 select-all">
                          /start {tgVerifyCode}
                        </code>
                        <button
                          onClick={handleCopyCode}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {tgCodeCopied ? (
                            <Check size={15} className="text-teal-500" />
                          ) : (
                            <Copy size={15} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kode berlaku 15 menit. Setelah kirim, klik "Cek Status".
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCheckTgStatus}
                        disabled={tgCheckLoading}
                        variant="outline"
                        className="h-9 px-4 text-sm gap-2"
                      >
                        {tgCheckLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <RefreshCw size={13} />
                        )}
                        Cek Status
                      </Button>
                      <Button
                        onClick={handleGenerateTgCode}
                        disabled={tgLoading}
                        variant="outline"
                        className="h-9 px-4 text-sm"
                      >
                        Minta Kode Baru
                      </Button>
                    </div>
                  </div>
                )}

                {tgFeedback && (
                  <Alert type={tgFeedback.type} message={tgFeedback.message} />
                )}
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-500" />
                  <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                    Telegram terhubung
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Aktifkan Notifikasi Harian
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Terima rekomendasi produk setiap hari
                      </p>
                    </div>
                    <button
                      onClick={() => handleTgNotifToggle(!tgNotifEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tgNotifEnabled
                          ? "bg-teal-500"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tgNotifEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {tgNotifEnabled && (
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">
                        Jam Notifikasi (WIB)
                      </label>
                      <select
                        value={tgNotifHour}
                        onChange={(e) =>
                          handleTgHourChange(Number(e.target.value))
                        }
                        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, "0")}:00 WIB
                            {i === 5 ? " (default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {tgFeedback && (
                  <Alert type={tgFeedback.type} message={tgFeedback.message} />
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleTgTest}
                    disabled={tgTestLoading}
                    variant="outline"
                    className="h-9 px-4 text-sm gap-2"
                  >
                    {tgTestLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    Kirim Pesan Tes
                  </Button>
                  <Button
                    onClick={handleTgDisconnect}
                    disabled={tgDisconnectLoading}
                    variant="outline"
                    className="h-9 px-4 text-sm font-semibold border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                  >
                    {tgDisconnectLoading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      "Putuskan"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Danger Zone */}
        <div ref={dangerRef}>
          <Section icon={<Trash2 size={18} />} title="Danger Zone">
            <p className="text-sm text-muted-foreground mb-4">
              Menghapus akun akan menghapus semua data kamu secara permanen —
              profil, data TikTok, dan semua hasil analisis. Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="h-9 px-5 text-sm font-semibold border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
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
