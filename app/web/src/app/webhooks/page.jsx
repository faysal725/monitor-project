"use client";
import { useWebhookEvents } from "@/lib/hooks";
import WebhookFeedItem from "@/components/WebhookFeedItem";

export default function WebhooksPage() {
  const { events } = useWebhookEvents();

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Live Webhook Inspector</h1>
      <div className="space-y-2">
        {events.map((event) => (
          <WebhookFeedItem key={event.id} event={event} />
        ))}
      </div>
    </main>
  );
}