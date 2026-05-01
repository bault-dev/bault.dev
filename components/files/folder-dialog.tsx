"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useFilesStore } from "@/store/files-store";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Folder, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FolderDialogProps {
  parentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  "#6B7280", // Gray
  "#EF4444", // Red
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
];

const folderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().default("#6B7280"),
});

export function FolderDialog({ parentId, open, onOpenChange }: FolderDialogProps) {
  const { createFolder } = useFilesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      color: "#6B7280",
    },
    validators: {
      onChange: folderSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        await createFolder(value.name, parentId, value.color);
        toast.success("Folder created");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error("Failed to create folder");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>

          <form.Field
            name="name"
            children={(field) => (
              <form.Field
                name="color"
                children={(colorField) => (
                  <Field
                    name={field.name}
                    data-invalid={field.state.meta.errors.length > 0}
                  >
                    <FieldLabel>Name</FieldLabel>
                    <div className="relative">
                      <InputGroup>
                        <InputGroupAddon>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-6 p-0 hover:bg-transparent"
                                type="button"
                              >
                                <Folder
                                  className="size-4"
                                  style={{
                                    color: colorField.state.value || "#6B7280",
                                    fill: colorField.state.value || "#6B7280",
                                  }}
                                />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-2" align="start">
                              <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((presetColor) => (
                                  <div
                                    key={presetColor}
                                    className={cn(
                                      "size-8 rounded-md cursor-pointer border-2 transition-all",
                                      colorField.state.value === presetColor
                                        ? "border-primary"
                                        : "border-transparent"
                                    )}
                                    style={{ backgroundColor: presetColor }}
                                    onClick={() => {
                                      colorField.handleChange(presetColor);
                                    }}
                                  />
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          placeholder="My Folder"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          autoFocus
                        />
                      </InputGroup>
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            )}
          />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
