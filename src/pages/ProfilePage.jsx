/**
 * ProfilePage.jsx — Gestión del perfil de usuario.
 *
 * Responsabilidad:
 * - Mostrar datos del usuario (sincronizados con el backend).
 * - Permitir la edición del perfil (Nombre, Email, Password).
 * - Gestionar el cierre de sesión (Logout).
 * - Estética unificada con UserDetailPage.
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
import {
  LogOut,
  Save,
  User as UserIcon,
  Loader2,
  ArrowLeft,
  Edit2,
  X,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, clearSession, updateUser } = useAuthStore();

  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
          updateUser(response.data);
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
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      const response = await updateMe(payload);
      if (response.success) {
        updateUser(response.data);
        setSuccess(true);
        setIsEditing(false); // Volver al modo vista tras éxito
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
    <div className="container mx-auto py-10 px-4 space-y-6 max-w-4xl">
      {/* BOTÓN VOLVER (NUEVO) */}
      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>

      {/* HEADER RESUMEN (Refinado) */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
              {user?.role?.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-center md:justify-start text-muted-foreground gap-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{user?.email}</span>
          </div>
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* FORMULARIO / VISTA DE DETALLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Información" : "Información de Usuario"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Actualizá tus datos personales. Recordá que el rol solo puede ser cambiado por otro administrador."
              : "Gestioná tu cuenta y visualizá tus permisos en el sistema."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <form
              id="profile-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "El nombre es obligatorio",
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
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
                    <p className="text-xs text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
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
                    <p className="text-xs text-destructive font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Rol Empleado</Label>
                  <Input
                    value={user?.role?.toUpperCase()}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-[10px] text-muted-foreground italic">
                    * El rol no es editable por el propio usuario.
                  </p>
                </div>
              </div>

              {apiError && (
                <div className="p-3 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                  ⚠ {apiError}
                </div>
              )}
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Permisos de Rol
                  </p>
                  <p className="font-medium mt-1 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Miembro Desde
                  </p>
                  <p className="font-medium mt-1">
                    {new Date(user?.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
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
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic font-medium">
              ✓ La sesión es válida por 24 horas desde el último ingreso.
            </p>
          )}
        </CardFooter>
      </Card>
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-700 dark:text-green-600"
          >
            SUCCESS
          </Badge>
          <p className="text-sm text-green-700 dark:text-green-600">
            Perfil actualizado correctamente.
          </p>
        </div>
      )}
    </div>
  );
}
