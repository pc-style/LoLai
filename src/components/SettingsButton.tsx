'use client';

import { Settings } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function SettingsButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4"
      onClick={() => router.push('/settings')}
      title="Settings"
    >
      <Settings className="h-5 w-5" />
    </Button>
  );
} 