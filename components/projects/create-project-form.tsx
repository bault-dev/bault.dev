"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import * as LucideIcons from "lucide-react"; // Import all icons to dynamically render
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DialogFooter } from "@/components/ui/dialog";

// Define the 5 preset icons
const PRESET_ICONS = [
  "GalleryVerticalEnd",
  "AudioWaveform",
  "Command",
  "Box",
  "Layers",
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  icon: z.enum(PRESET_ICONS, {
    required_error: "Please select an icon",
  }),
});

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "GalleryVerticalEnd",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (!values.name) return; // Should be handled by generic validation, but safe guard

      await authClient.organization.create({
        name: values.name,
        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
        logo: values.icon, // We store the icon name in the logo field for now
        fetchOptions: {
          onSuccess: () => {
            toast.success("Project created successfully!");
            router.refresh(); // Refresh to update session/middleware
            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/");
            }
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          }
        }
      });
    } catch (error) {
      // handled in onError
    } finally {
      setIsLoading(false);
    }
  }

  // Helper component to render icon by name
  const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
    // @ts-ignore - LucideIcons is dynamic
    const Icon = LucideIcons[name + "Icon"] || LucideIcons.HelpCircle;
    return <Icon className={className} />;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Icon</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <div className="flex size-6 items-center justify-center rounded-md border p-1">
                            <IconRenderer name={field.value} className="size-4" />
                          </div>
                          {field.value}
                        </div>
                      ) : (
                        "Select icon"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-2">
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_ICONS.map((iconName) => (
                      <div
                        key={iconName}
                        className={cn(
                          "flex aspect-square cursor-pointer items-center justify-center rounded-md border hover:bg-accent",
                          field.value === iconName ? "bg-accent border-primary" : "border-transparent"
                        )}
                        onClick={() => form.setValue("icon", iconName)}
                      >
                        <IconRenderer name={iconName} className="size-5" />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
