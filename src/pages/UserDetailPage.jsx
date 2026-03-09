/**
 * UserDetailPage.jsx — Detalle de usuario (Admin).
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getUserById, updateUserAdmin, deleteUser } from "@/api/users.api";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "../components/shared/ThemeToggle";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Loader2,
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  X,
  Mail,
  Shield,
  Calendar,
  RefreshCw,
  Hash,
} from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUser(response.data);
      reset({
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
      });
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "No se pudo cargar el usuario.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const onUpdateUser = async (data) => {
    setApiError(null);
    try {
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;

      await updateUserAdmin(id, updateData);
      setIsEditing(false);
      fetchUser();
    } catch (err) {
      setApiError(
        err.response?.data?.error?.message || "Error al actualizar el usuario.",
      );
    }
  };

  const onDeleteUser = async () => {
    try {
      await deleteUser(id);
      navigate("/users");
    } catch (err) {
      setApiError(
        err.response?.data?.error?.message ||
          "No se pudo desactivar el usuario.",
      );
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">
          Cargando perfil...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <X className="h-5 w-5" /> Error al cargar
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isSelf = currentUser?._id === user?._id;

  return (
    <div className="container mx-auto py-10 px-4 space-y-6 max-w-4xl">
      {/* Barra de navegación superior */}
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Usuarios
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
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <CardTitle className="text-3xl font-bold">
                  {user?.name}
                </CardTitle>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Badge variant={user?.isActive ? "default" : "destructive"}>
                    {user?.isActive ? "ACTIVO" : "INACTIVO"}
                  </Badge>
                </div>
              </div>
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

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isSelf}>
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción desactivará al usuario{" "}
                        <strong>{user.name}</strong>. No podrá iniciar sesión
                        hasta que un administrador lo reactive.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    {apiError && (
                      <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex items-center gap-2 my-2">
                        <X className="h-4 w-4 shrink-0" />
                        <p>{apiError}</p>
                      </div>
                    )}
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeleteUser}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Confirmar Eliminación
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-8 px-6 md:px-12">
          {isEditing ? (
            <form
              id="edit-user-form"
              onSubmit={handleSubmit(onUpdateUser)}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "El nombre es requerido",
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acceso</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "El email es requerido",
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
                  <Label htmlFor="role">Rol del Sistema</Label>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(val) =>
                      setValue("role", val, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Dejar vacío para mantener actual"
                    {...register("password", {
                      validate: (val) => {
                        if (!val) return true;
                        if (val.length < 8) return "Mínimo 8 caracteres";
                        if (!/[A-Z]/.test(val)) return "Al menos una mayúscula";
                        if (!/[a-z]/.test(val)) return "Al menos una minúscula";
                        if (!/[0-9]/.test(val)) return "Al menos un número";
                        return true;
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
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
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
                  {new Date(user.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Fecha de registro en el sistema
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                  <RefreshCw className="h-4 w-4" />
                  <span>Último Cambio</span>
                </div>
                <p className="text-lg font-medium">
                  {new Date(user.updatedAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Actualización automática
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 px-6 py-4 mt-6">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button
                form="edit-user-form"
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </>
          ) : (
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground italic font-medium">
              <p>* Información administrativa oficial coordinada.</p>
              <p>Estado Sincronizado ✓</p>
            </div>
          )}
        </CardFooter>
      </Card>

      {isSelf && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-700 dark:text-blue-400"
          >
            INFO
          </Badge>
          <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
            Estás visualizando tu propio perfil administrativo. El borrado está
            deshabilitado.
          </p>
        </div>
      )}
    </div>
  );
}
