import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Real-Time API & Webhook Health Monitor</h1>
      <p className="text-muted-foreground max-w-xl mb-8">
        Monitor endpoint uptime, inspect live webhooks, and get AI-generated root cause analysis the moment something breaks.
      </p>
      <Link href="/dashboard">
        <Button size="lg">Get Started</Button>
      </Link>
    </main>
  );
}