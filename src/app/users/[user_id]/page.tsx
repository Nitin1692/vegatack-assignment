"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiClient";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function UserProfile(props: {params: Promise<{ user_id: string }>}) {
  const [user, setUser] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const {user_id} = await props.params;

  const fetchUser = async () => {
    const data = await apiFetch(`/api/users/${user_id}/`);
    setUser(data);
    const followData = await apiFetch(`/api/users/${user_id}/follow-status/`);
    setFollowing(followData.following);
  };

  const handleFollow = async () => {
    if (following) await apiFetch(`/api/users/${user_id}/follow/`, "DELETE");
    else await apiFetch(`/api/users/${user_id}/follow/`, "POST");
    setFollowing(!following);
  };

  useEffect(() => { fetchUser(); }, [user_id]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <Avatar><AvatarFallback>{user.username?.[0]}</AvatarFallback></Avatar>
        <h1 className="text-xl font-bold">{user.username}</h1>
      </div>
      <Button onClick={handleFollow}>
        {following ? "Unfollow" : "Follow"}
      </Button>
    </div>
  );
}
