/**
 * UserDetailPage.jsx — Detalle de usuario (Admin).
 *
 * Responsabilidad: Orquestar la vista, edición y desactivación de un usuario.
 * Sigue estrictamente la sección 4.3 del spec.
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
import { Loader2, ArrowLeft, Edit2, Trash2, Save, X } from "lucide-react";

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
    formState: { errors, isSubmitting },
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
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isSelf = currentUser?._id === user?._id;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" /> Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSelf}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción desactivará al usuario{" "}
                    <strong>{user.name}</strong>. Podrás volver a activarlo
                    desde la base de datos si es necesario, pero no aparecerá
                    más en los listados activos.
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {isEditing ? (
            <form
              id="edit-user-form"
              onSubmit={handleSubmit(onUpdateUser)}
              className="space-y-4"
            >
              {apiError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 border border-destructive/20">
                  {apiError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "El nombre es requerido",
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
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
                      required: "El email es requerido",
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

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(val) => setValue("role", val)}
                  >
                    <SelectTrigger>
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
                    placeholder="Dejar vacío para no cambiar"
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
                    <p className="text-xs text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ID de Usuario</p>
                <p className="font-mono text-xs bg-muted p-1 rounded inline-block">
                  {user._id}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rol</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Fecha de Creación
                </p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}{" "}
                  {new Date(user.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Última Actualización
                </p>
                <p className="font-medium">
                  {new Date(user.updatedAt).toLocaleDateString()}{" "}
                  {new Date(user.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 bg-muted/50 mt-6 pt-6">
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
                disabled={isSubmitting}
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
              * El administrador puede gestionar los datos de acceso y permisos
              de este usuario.
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
            eliminación ha sido deshabilitado por seguridad (Spec 5.2).
          </p>
        </div>
      )}
    </div>
  );
}
