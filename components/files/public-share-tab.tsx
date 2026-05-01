"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Copy, Check, Loader2, Globe, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateShareLinkSettings, revokeShareLink } from "@/app/actions/files-actions";
import { Badge } from "@/components/ui/badge";

export function PublicShareTab({
  fileId,
  token,
  initialExpiresAt,
  initialHasPassword,
  onClose
}: {
  fileId: string;
  token: string;
  initialExpiresAt?: Date | null;
  initialHasPassword?: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [hasExpiration, setHasExpiration] = useState(!!initialExpiresAt);
  const [expirationStr, setExpirationStr] = useState("null"); // "null" is handled as 'Never' or manually mapped initially
  const [customExpirationDate] = useState<Date | null>(initialExpiresAt || null);
  const [hasPassword, setHasPassword] = useState(!!initialHasPassword);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // When initialExpiresAt changes, we can try to guess the duration or just show it as a custom time until they change it.
    if (initialExpiresAt) {
      setHasExpiration(true);
      // Determine roughly if it was 1h, 24h, 7d
      const diffHrs = Math.round((new Date(initialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60));
      if (diffHrs > 0 && diffHrs <= 2) setExpirationStr("1h");
      else if (diffHrs > 2 && diffHrs <= 26) setExpirationStr("24h");
      else if (diffHrs > 26 && diffHrs <= 170) setExpirationStr("7d");
      else setExpirationStr("custom");
    }
  }, [initialExpiresAt]);

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let expiresAt: Date | null = null;
      if (hasExpiration && expirationStr !== "null") {
        expiresAt = new Date();
        if (expirationStr === "1h") expiresAt.setHours(expiresAt.getHours() + 1);
        else if (expirationStr === "24h") expiresAt.setHours(expiresAt.getHours() + 24);
        else if (expirationStr === "7d") expiresAt.setDate(expiresAt.getDate() + 7);
      }
      const pw = hasPassword && password.trim() ? password.trim() : null;

      const res = await updateShareLinkSettings(fileId, { expiresAt, password: pw });
      if (res.success) toast.success("Settings saved");
      else toast.error(res.error || "Failed to save settings");
    } catch {
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    try {
      await revokeShareLink(fileId);
      toast.success("Link revoked");
      onClose();
    } catch {
      toast.error("Failed to revoke");
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <FieldGroup>
        <Field>
          <FieldLabel onClick={handleCopy} className="cursor-pointer">Share link</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Globe />
            </InputGroupAddon>
            <InputGroupInput
              value={url}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="secondary" onClick={handleCopy} className="px-3">
                {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                Copy link
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>

      <Separator />

      <FieldGroup>
        <Field orientation="horizontal">
          <Switch id="expire-link" checked={hasExpiration} onCheckedChange={setHasExpiration} />
          <FieldLabel htmlFor="expire-link" className="font-normal cursor-pointer flex-1">
            Expire link
          </FieldLabel>
          {hasExpiration && (
            <Badge variant="default" className="flex items-center gap-2 text-amber-500 bg-amber-500/10">
              <Clock data-icon="inline-start" className="size-4" />
              {expirationStr === "custom" && customExpirationDate
                ? `until ${customExpirationDate.toLocaleString()}`
                : expirationStr !== "null"
                  ? `in ${expirationStr}`
                  : "Never"}
            </Badge>
          )}
        </Field>

        {hasExpiration && (
          <Field>
            <Select value={expirationStr} onValueChange={setExpirationStr}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="null">Never</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  {expirationStr === "custom" && <SelectItem value="custom">Custom Date</SelectItem>}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        )}

        <Field orientation="horizontal">
          <Switch id="password-link" checked={hasPassword} onCheckedChange={setHasPassword} />
          <FieldLabel htmlFor="password-link" className="font-normal flex-col items-start gap-1 cursor-pointer">
            Password
            <FieldDescription>Protect the assets you share</FieldDescription>
          </FieldLabel>
        </Field>

        {hasPassword && (
          <Field>
            <InputGroup>
              <InputGroupInput
                id="password-input"
                type="text"
                placeholder="Set password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputGroup>
          </Field>
        )}
      </FieldGroup>

      <div className="flex gap-3 pt-4 border-t mt-2">
        <Button variant="destructive" className="flex-1" onClick={handleRevoke}>
          Revoke Link
        </Button>
        <Button className="flex-1" disabled={saving} onClick={handleSave}>
          {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
