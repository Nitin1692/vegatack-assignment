"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/apiClient";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PostType {
  id: string;
  content: string;
  image_url?: string;
  category: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  comment_count: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await apiFetch("/api/posts");
        setPosts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // Create or Update Post
  async function handleSave() {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("category", category);
      formData.append("author", posts[0]?.author_id || "");
      if (imageFile) formData.append("image", imageFile);

      let data: PostType;
      if (editingPost) {
        data = await apiFetch(`/api/posts/${editingPost.id}`, "PUT", formData, {
          isFormData: true,
        });
        setPosts(posts.map((p) => (p.id === editingPost.id ? data : p)));
      } else {
        data = await apiFetch("/api/posts", "POST", formData, {
          isFormData: true,
        });
        setPosts([data, ...posts]);
      }

      setDialogOpen(false);
      setEditingPost(null);
      setContent("");
      setCategory("general");
      setImageFile(null);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Delete Post
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiFetch(`/api/posts/${id}`, "DELETE");
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Open edit dialog
  function handleEdit(post: PostType) {
    setEditingPost(post);
    setContent(post.content);
    setCategory(post.category);
    setDialogOpen(true);
  }

  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>

      <Button onClick={() => setDialogOpen(true)} className="mb-4">
        Create New Post
      </Button>

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={() => handleEdit(post)}
            onDelete={() => handleDelete(post.id)}
          />
        ))
      )}

      {/* Dialog for Create/Update */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Textarea
              placeholder="Write your post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>
              {editingPost ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
