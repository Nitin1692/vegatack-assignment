"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(res => res.json()).then(setProfile);
    fetch(`/api/follows/status/${id}`).then(res => res.json()).then(data => setIsFollowing(data.is_following));
  }, [id]);

const followUser = async () => {
  if (!id) {
    console.error("ID is undefined!");
    return;
  }

  await fetch(`/api/users/${id}/follow`, {
    method: "POST",
  });

  setIsFollowing(true);
};

  const unfollowUser = async () => {
    await fetch(`/api/users/${id}/follows`, { method: "DELETE" });
    setIsFollowing(false);
  };

  if (!profile) return null;

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardContent className="space-y-3">
        <h1 className="text-xl font-bold">{profile.username}</h1>
        <p>{profile.bio}</p>
        <p>Followers: {profile.followers_count} | Following: {profile.following_count}</p>
        {isFollowing ? (
          <Button onClick={unfollowUser}>Unfollow</Button>
        ) : (
          <Button onClick={followUser}>Follow</Button>
        )}
      </CardContent>
    </Card>
  );
}
