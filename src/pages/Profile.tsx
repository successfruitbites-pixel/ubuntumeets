import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { User, Camera, Trash2 } from "lucide-react";

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setDisplayName(data?.display_name || "");
    } else {
      navigate("/signin");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", user.id);

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Profile updated successfully!");
      }
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Password changed successfully!");
      setPassword("");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // In a real app, you'd call a Supabase Edge Function to delete the user
      // For now, we'll just sign them out and show a message
      await supabase.auth.signOut();
      navigate("/");
      alert("Account deletion request received. Please contact support to complete the process.");
    }
  };

  if (!profile) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

      {message && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm rounded-md p-4 mb-8">
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Info */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-[#1A6B3C]" />
            Profile Information
          </h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-[#1A6B3C]">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-gray-500" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-[#D4A017] p-2 rounded-full text-black hover:bg-[#D4A017]/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-white font-medium text-lg">{profile.full_name}</p>
              <p className="text-gray-400 text-sm">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you appear in meetings"
              />
            </div>
            <Button type="submit" className="bg-[#1A6B3C] hover:bg-[#1A6B3C]/90" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <Button type="submit" variant="outline" className="text-white border-white/20 hover:bg-white/10" disabled={loading || !password}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-500 mb-2 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button onClick={handleDeleteAccount} variant="danger">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
