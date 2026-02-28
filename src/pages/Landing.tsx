import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Video, Shield, MonitorUp, Users, Mic } from "lucide-react";

export function Landing() {
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      navigate(`/signup?name=${encodeURIComponent(displayName)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
            Secure. Private. <br />
            <span className="text-[#1A6B3C]">Made for Africa.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            UbuntuMeet is the privacy-focused video conferencing platform designed for African freelancers, micro businesses, and professionals.
          </p>
          
          <form onSubmit={handleGetStarted} className="max-w-md mx-auto flex gap-3">
            <Input
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 text-lg"
              required
            />
            <Button type="submit" size="lg" className="bg-[#D4A017] hover:bg-[#D4A017]/90 text-black font-semibold h-12 px-8">
              Get Started
            </Button>
          </form>
        </div>

        {/* Features Section */}
        <div className="bg-[#111111] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<Mic className="h-8 w-8 text-[#1A6B3C]" />}
                title="Local Recording"
                description="Record your meetings locally. No server storage, maximum privacy."
              />
              <FeatureCard 
                icon={<Users className="h-8 w-8 text-[#D4A017]" />}
                title="Co-Host Controls"
                description="Promote participants to co-hosts to help manage your meetings."
              />
              <FeatureCard 
                icon={<MonitorUp className="h-8 w-8 text-[#1A6B3C]" />}
                title="Screen Share"
                description="Share your screen with high quality and low latency."
              />
              <FeatureCard 
                icon={<Shield className="h-8 w-8 text-[#D4A017]" />}
                title="End-to-End Privacy"
                description="Rooms are created fresh and deleted immediately after use."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#0D0D0D] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="bg-white/5 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
