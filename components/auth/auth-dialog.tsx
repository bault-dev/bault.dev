"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AtSignIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { authClient } from "@/lib/auth-client";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  flow: "LOGIN" | "REGISTER";
}

export function AuthDialog({
  isOpen,
  onOpenChange,
  email,
  flow,
}: AuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(flow === "LOGIN" ? loginSchema : registerSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema> | z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      if (flow === "LOGIN") {
        await authClient.signIn.email({
          email,
          password: values.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Welcome back!");
              router.push("/"); // Or wherever you redirect
              onOpenChange(false);
            },
            onError: (ctx) => {
              toast.error(ctx.error.message);
            }
          },
        });
      } else {
        const registerValues = values as z.infer<typeof registerSchema>;
        await authClient.signUp.email({
          email,
          password: registerValues.password,
          name: registerValues.name,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Account created successfully!");
              router.push("/");
              onOpenChange(false);
            },
            onError: (ctx) => {
              toast.error(ctx.error.message);
            }
          },
        });
      }
    } catch {
      // Error handled in fetchOptions
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {flow === "LOGIN" ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription>
            {flow === "LOGIN"
              ? "Enter your password to sign in to your account."
              : "Fill in your details to create your new account."}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <Label>Email</Label>
          <InputGroup className="bg-muted opacity-100 mt-1.5">
            <InputGroupInput
              type="email"
              value={email}
              disabled
            />
            <InputGroupAddon>
              <AtSignIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {flow === "REGISTER" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    {flow === "LOGIN" && (
                      <Button variant="link" size="sm" className="p-0 h-auto font-normal text-xs" type="button">
                        Forgot password?
                      </Button>
                    )}
                  </div>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="******"
                      {...(flow === "LOGIN" ? {
                        tabIndex: 0,
                        autoFocus: true
                      } : {
                        tabIndex: -1
                      })}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {flow === "LOGIN" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
