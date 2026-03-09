/**
 * ProfilePage.jsx — Gestión del perfil de usuario.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import {
  getMe,
  updateMe,
  logout as logoutService,
  deleteMe,
} from "../api/auth.api";
import { ThemeToggle } from "../components/shared/ThemeToggle";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Save,
  Loader2,
  ArrowLeft,
  Edit2,
  X,
  Mail,
  Calendar,
  Shield,
  Hash,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, clearSession, updateUser } = useAuthStore();

  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onTouched",
  });

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
        setIsEditing(false);
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setApiError(null);
    try {
      const response = await deleteMe();
      if (response.success) {
        clearSession();
        navigate("/login", { replace: true });
      }
    } catch (error) {
      const message =
        error.response?.data?.error?.message || "No se pudo eliminar la cuenta";
      setApiError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isSyncing) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
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
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <ThemeToggle />
      </div>

      <Card className="overflow-hidden shadow-md">
        <CardHeader className="bg-muted/30 border-b pb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left space-y-1.5">
              <CardTitle className="text-3xl font-bold">{user?.name}</CardTitle>
              <CardDescription className="flex items-center justify-center md:justify-start gap-4 text-base">
                <span className="flex items-center gap-1.5 text-foreground/80">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
              </CardDescription>
            </div>

            {!isEditing && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-background"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Editar
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
                  Salir
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 px-6 md:px-12">
          {isEditing ? (
            <form
              id="profile-form"
              onSubmit={handleSubmit(onUpdateSubmit)}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
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
                    placeholder="Dejar vacío para mantener actual"
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
              </div>

              {apiError && (
                <div className="p-3 text-sm border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                  ⚠ {apiError}
                </div>
              )}
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 py-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <Hash className="h-4 w-4" />
                  <span>ID de Usuario</span>
                </div>
                <p className="font-mono text-sm break-all pt-1">{user?._id}</p>
                <p className="text-xs text-muted-foreground italic">
                  Identificador único del servidor
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <Shield className="h-4 w-4" />
                  <span>Rol del Sistema</span>
                </div>
                <p className="text-lg font-medium capitalize">
                  {user?.role.toUpperCase()}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Categoría de permisos
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde</span>
                </div>
                <p className="text-lg font-medium">
                  {new Date(user?.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Fecha de registro en el sistema
                </p>
              </div>

              <div className="flex flex-col flex-end">
                <div className="mt-auto pt-4 border-t border-dashed md:border-none">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10 border-destructive/20 w-fit"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar mi cuenta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="h-5 w-5" /> ¿Estás
                          completamente seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4">
                          <p>
                            Esta acción desactivará tu cuenta de forma
                            inmediata. No podrás volver a ingresar al sistema a
                            menos que un administrador reactive tu perfil.
                          </p>
                          <p className="font-bold">
                            Tu sesión se cerrará automáticamente.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Mejor no</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          disabled={isDeleting}
                        >
                          {isDeleting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirmar Eliminación
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 px-6 py-4 mt-6">
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
            <p className="text-xs text-muted-foreground italic font-medium w-full text-center md:text-right">
              ✓ Esta es una vista segura de tus datos registrados.
            </p>
          )}
        </CardFooter>
      </Card>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-700 dark:text-green-600"
          >
            ÉXITO
          </Badge>
          <p className="text-sm text-green-700 dark:text-green-600 font-medium">
            Perfil actualizado correctamente.
          </p>
        </div>
      )}

      {apiError && !isEditing && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Badge
            variant="outline"
            className="bg-destructive/20 text-destructive"
          >
            ERROR
          </Badge>
          <p className="text-sm text-destructive font-medium">{apiError}</p>
        </div>
      )}
    </div>
  );
}
