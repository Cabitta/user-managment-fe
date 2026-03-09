/**
 * UserDetailPage.jsx — Detalle de usuario (Admin).
 *
 * Responsabilidad: Orquestar la vista, edición y desactivación de un usuario.
 * Sigue estrictamente la sección 4.3 del spec.
 * Estética unificada con ProfilePage (Header Resumen).
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getUserById, updateUserAdmin, deleteUser } from "@/api/users.api";
import { useAuthStore } from "@/store/authStore";

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
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ArrowLeft,
  Edit2,
  Trash2,
  Save,
  X,
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  RefreshCw,
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

  // Carga inicial del usuario
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(id);
      setUser(response.data);
      // Pre-poblar el formulario
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

  // Manejo de la edición
  const onUpdateUser = async (data) => {
    setApiError(null);
    try {
      // Si el password está vacío, lo eliminamos del objeto para no enviarlo
      const updateData = { ...data };
      if (!updateData.password) delete updateData.password;

      await updateUserAdmin(id, updateData);
      setIsEditing(false);
      fetchUser(); // Refrescar datos
    } catch (err) {
      setApiError(
        err.response?.data?.error?.message || "Error al actualizar el usuario.",
      );
    }
  };

  // Manejo del borrado (soft-delete)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Cargando detalles del usuario...
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
      {/* BOTÓN VOLVER */}
      <div className="flex justify-start">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Usuarios
        </Button>
      </div>

      {/* HEADER RESUMEN (Estilo ProfilePage) */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card border rounded-xl shadow-sm">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {getInitials(user?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h1 className="text-3xl font-bold tracking-tight">{user?.name}</h1>
            <Badge variant={user?.isActive ? "default" : "destructive"}>
              {user?.isActive ? "ACTIVO" : "INACTIVO"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {user?.role}
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
              onClick={() => setIsEditing(true)}
              size="sm"
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
                    <strong>{user.name}</strong>. No podrá iniciar sesión hasta
                    que un administrador lo reactive.
                  </AlertDialogDescription>
                </AlertDialogHeader>
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

      <Separator />

      {/* CONTENIDO PRINCIPAL / FORMULARIO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            {isEditing ? "Editar Información" : "Información Detallada"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Modificá los datos del usuario. El rol y el email afectan el acceso al sistema."
              : "Vista completa del registro del usuario en la base de datos."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <form
              id="edit-user-form"
              onSubmit={handleSubmit(onUpdateUser)}
              className="space-y-6"
            >
              {apiError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                  ⚠ {apiError}
                </div>
              )}

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
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ID Interno
                  </p>
                  <p className="font-mono text-sm mt-1">{user._id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Permisos de Rol
                  </p>
                  <p className="font-medium mt-1 capitalize">{user.role}</p>
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
                    {new Date(user.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Último Cambio
                  </p>
                  <p className="font-medium mt-1">
                    {new Date(user.updatedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    , {new Date(user.updatedAt).toLocaleTimeString()}
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
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              * Los datos mostrados arriba son la versión actual guardada en el
              servidor.
            </p>
          )}
        </CardFooter>
      </Card>

      {isSelf && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-700 dark:text-blue-400"
          >
            INFO
          </Badge>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Estás visualizando tu propio perfil administrativo. El botón de
            eliminación ha sido deshabilitado por seguridad.
          </p>
        </div>
      )}
    </div>
  );
}
