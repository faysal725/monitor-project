"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";



export default function AddMonitorDialog({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [interval, setInterval_] = useState("60");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!url.trim() || !url.startsWith("http")) {
      setError("Enter a valid URL starting with http:// or https://");
      return;
    }
    const intervalNum = Number(interval);
    if (!intervalNum || intervalNum <= 0) {
      setError("Interval must be a positive number");
      return;
    }

    try {
      await onAdd({ url: url.trim(), method, intervalSeconds: intervalNum });
      setUrl("");
      setMethod("GET");
      setInterval_("60");
      setError("");
      setOpen(false);
    } catch (err) {
      setError("Failed to add monitor. Check API server is running.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Monitor
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Add New Monitor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="url">Endpoint URL</Label>
            <Input
              id="url"
              placeholder="https://api.example.com/v1/resource"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-slate-950 border-slate-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method">Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger id="method" className="bg-slate-950 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interval">Check Interval (seconds)</Label>
            <Input
              id="interval"
              type="number"
              value={interval}
              onChange={(e) => setInterval_(e.target.value)}
              className="bg-slate-950 border-slate-800"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>Add Monitor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}