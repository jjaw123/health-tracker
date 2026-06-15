"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X, Upload, SwitchCamera, Circle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export default function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }

    let cancelled = false;

    void (async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (!navigator.mediaDevices?.getUserMedia) {
        if (!cancelled) setError("Camera not supported in this browser. Upload a photo instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          if (!cancelled) setReady(true);
        }
      } catch {
        if (!cancelled) setError("Camera access denied or unavailable. Upload a photo instead.");
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const data = canvas.toDataURL("image/jpeg", 0.85);
    stopStream();
    onCapture(data);
    onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCapture(reader.result as string);
      onClose();
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const toggleFacing = async () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    stopStream();
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setReady(true);
      }
    } catch {
      setError("Could not switch camera.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { stopStream(); onClose(); }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="card fixed inset-x-4 top-[8%] z-[61] mx-auto max-w-lg overflow-hidden p-0"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Camera size={16} className="text-brand" /> Snap Your Meal
              </h2>
              <button type="button" onClick={() => { stopStream(); onClose(); }} className="btn-ghost rounded-lg p-2">
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
              />
              {!ready && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted">
                  Starting camera…
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/90 px-6 text-center">
                  <p className="text-sm text-ink-muted">{error}</p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn btn-primary gap-2"
                  >
                    <Upload size={16} /> Upload Photo
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn btn-ghost gap-2 text-sm"
              >
                <Upload size={16} /> Gallery
              </button>
              <button
                type="button"
                onClick={capture}
                disabled={!ready}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg disabled:opacity-40"
                aria-label="Take photo"
              >
                <Circle size={28} fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={toggleFacing}
                className="btn btn-ghost gap-2 text-sm"
              >
                <SwitchCamera size={16} /> Flip
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
