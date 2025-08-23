"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiClient";
import {PostCard} from "@/components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);

  const fetchFeed = async () => {
    const data = await apiFetch("/api/feed/");
    setPosts(data.posts);
  };

  useEffect(() => { fetchFeed(); }, []);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}
