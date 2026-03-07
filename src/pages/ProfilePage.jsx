/**
 * ProfilePage.jsx — Gestión del perfil de usuario.
 *
 * Responsabilidad:
 * - Mostrar datos del usuario (sincronizados con el backend).
 * - Permitir la edición del perfil (Nombre, Email, Password).
 * - Gestionar el cierre de sesión (Logout).
 *
 * Al montar, pide datos frescos al servidor vía GET /api/auth/me (Spec 3.1).
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import { getMe, updateMe, logout as logoutService } from "../api/auth.api";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, Save, User as UserIcon, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setSession, clearSession, updateUser } = useAuthStore();

  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onTouched",
  });

  // Sincronización inicial con el backend (Spec 3.1)
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          // Actualizamos el store con los datos frescos
          updateUser(response.data);
          // Pre-cargamos el formulario
          reset({
            name: response.data.name,
            email: response.data.email,
          });
        }
      } catch (error) {
        console.error("Error sincronizando perfil:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncProfile();
  }, [reset, updateUser]);

  const onUpdateSubmit = async (data) => {
    setApiError(null);
    setSuccess(false);
    setIsUpdating(true);

    try {
      // Limpiamos campos vacíos para no enviar password si no se cambió
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      const response = await updateMe(payload);
      if (response.success) {
        updateUser(response.data);
        setSuccess(true);
        // Limpiamos el campo de password por seguridad
        reset({ name: response.data.name, email: response.data.email });
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "Error al actualizar el perfil";
      setApiError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutService();
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  if (isSyncing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback para iniciales del Avatar
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER / RESUMEN */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
              <h1 className="text-3xl font-bold tracking-tight">
                {user?.name}
              </h1>
              <Badge
                variant={user?.role === "admin" ? "default" : "secondary"}
                className="w-fit mx-auto md:mx-0"
              >
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Cerrar sesión
          </Button>
        </div>

        <Separator />

        {/* FORMULARIO DE EDICIÓN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Editar Información
            </CardTitle>
            <CardDescription>
              Mantené tus datos actualizados. Solo los campos que modifiques
              serán guardados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="profile-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "El nombre es obligatorio",
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "El email es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Dejar vacío para no cambiar"
                  {...register("password", {
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    validate: {
                      complexity: (v) => {
                        if (!v) return true;
                        const hasUpper = /[A-Z]/.test(v);
                        const hasLower = /[a-z]/.test(v);
                        const hasNum = /[0-9]/.test(v);
                        return (
                          (hasUpper && hasLower && hasNum) ||
                          "Debe tener mayúsculas, minúsculas y números"
                        );
                      },
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {apiError && (
                <div className="p-3 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                  ⚠ {apiError}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm border border-green-500/50 bg-green-500/10 text-green-600 rounded-md">
                  ✓ Perfil actualizado correctamente.
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
            <Button
              type="submit"
              form="profile-form"
              disabled={!isDirty || isUpdating}
              className="gap-2"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
