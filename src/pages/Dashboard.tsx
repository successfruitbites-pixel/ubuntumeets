import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Video, Link as LinkIcon, Clock, Users } from "lucide-react";

export function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [joinLink, setJoinLink] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchMeetings();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        // Fallback if the profiles table doesn't exist yet or trigger failed
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          _dbError: true
        });
      } else {
        setProfile(data || {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        });
      }
    } else {
      navigate("/signin");
    }
  };

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("host_id", user.id)
        .order("started_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Meetings fetch error:", error);
      } else if (data) {
        setMeetings(data);
      }
    }
  };

  const handleStartMeeting = async () => {
    setLoading(true);
    try {
      // Create room via our secure backend
      const response = await fetch("/api/create-room", {
        method: "POST",
      });
      const room = await response.json();

      if (room.error) {
        throw new Error(`${room.error}: ${room.info || 'Unknown error'}`);
      }

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("meetings").insert({
          room_name: room.name,
          host_id: user.id,
        });
      }

      // Navigate to meeting room
      navigate(`/meeting/${room.name}?url=${encodeURIComponent(room.url)}`);
    } catch (error) {
      console.error("Failed to start meeting:", error);
      alert("Failed to start meeting. Please check your API keys.");
    }
    setLoading(false);
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinLink.trim()) {
      // Extract room name from URL if it's a full Daily.co URL
      let roomName = joinLink.trim();
      let url = joinLink.trim();
      
      if (roomName.includes("daily.co/")) {
        const parts = roomName.split("/");
        roomName = parts[parts.length - 1];
      } else {
        // If they just entered a room name, we need to construct the URL
        // But we don't know their domain. For simplicity, we assume they pass the full URL or we just pass the room name and let the meeting component handle it.
        url = `https://your-domain.daily.co/${roomName}`; // This is a fallback, ideally they paste the full link
      }
      
      navigate(`/meeting/${roomName}?url=${encodeURIComponent(url)}`);
    }
  };

  if (!profile) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {profile.display_name || profile.full_name}!</h1>
        <p className="text-gray-400 mt-2">Ready to connect with your team?</p>
        {profile._dbError && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-sm rounded-md p-4">
            <strong>Warning:</strong> It looks like the database tables haven't been created yet. Please run the SQL commands from the <code>supabase.sql</code> file in your Supabase SQL Editor to enable full functionality (like saving meetings and profile updates).
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Start Meeting Card */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <div className="bg-[#1A6B3C]/20 p-4 rounded-full mb-6">
            <Video className="h-10 w-10 text-[#1A6B3C]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Start a Meeting</h2>
          <p className="text-gray-400 mb-8">Create a secure, private room instantly.</p>
          <Button 
            onClick={handleStartMeeting} 
            disabled={loading}
            size="lg" 
            className="w-full bg-[#1A6B3C] hover:bg-[#1A6B3C]/90 text-white h-14 text-lg"
          >
            {loading ? "Creating Room..." : "Start Instant Meeting"}
          </Button>
        </div>

        {/* Join Meeting Card */}
        <div className="bg-[#111111] p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center">
          <div className="bg-[#D4A017]/20 p-4 rounded-full mb-6">
            <LinkIcon className="h-10 w-10 text-[#D4A017]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Join a Meeting</h2>
          <p className="text-gray-400 mb-8">Enter a meeting link or room name to join.</p>
          <form onSubmit={handleJoinMeeting} className="w-full flex gap-3">
            <Input
              type="text"
              placeholder="Meeting link (e.g., https://domain.daily.co/room)"
              value={joinLink}
              onChange={(e) => setJoinLink(e.target.value)}
              className="h-14 text-base"
              required
            />
            <Button type="submit" size="lg" className="bg-white text-black hover:bg-gray-200 h-14 px-8">
              Join
            </Button>
          </form>
        </div>
      </div>

      {/* Recent Meetings */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Recent Meetings</h2>
        {meetings.length === 0 ? (
          <div className="bg-[#111111] p-8 rounded-2xl border border-white/10 text-center">
            <p className="text-gray-400">No recent meetings found.</p>
          </div>
        ) : (
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-sm font-medium text-gray-400">Room Name</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="p-4 text-sm font-medium text-gray-400">Participants</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{meeting.room_name}</td>
                    <td className="p-4 text-gray-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(meeting.started_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {meeting.participant_count || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
