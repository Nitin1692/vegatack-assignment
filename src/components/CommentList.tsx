"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/apiClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CommentList({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");

  const fetchComments = async () => {
    const data = await apiFetch(`/api/posts/${postId}/comments/`);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!content) return;
    await apiFetch(`/api/posts/${postId}/comments/`, "POST", { content });
    setContent("");
    fetchComments();
  };

  useEffect(() => { fetchComments(); }, [postId]);

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <span className="font-semibold">{c.author?.username}</span>: {c.content}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment"
        />
        <Button size="sm" onClick={handleAddComment}>Send</Button>
      </div>
    </div>
  );
}
