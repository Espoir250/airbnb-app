import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";

export function useUploadAvatar() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadAvatar(file: File): Promise<string | null> {
    if (!user?.id) return null;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/upload/${user.id}/avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data.avatar as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadAvatar, isUploading, error };
}