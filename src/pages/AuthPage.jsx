/**
 * AuthPage.jsx — Pantalla de Login y Registro.
 *
 * Responsabilidad: Orquestar el flujo de autenticación.
 *
 * - UI: Usa Tabs de shadcn/ui para alternar modos.
 * - Form: Manejado con React Hook Form.
 * - Seguridad: Cumple con las reglas de validación del backend (spec 4.1).
 * - Errores:
 *   - Locales: debado de cada input (RHF errors).
 *   - Globales: encima del botón de submit (alert state).
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import {
  login as loginService,
  register as registerService,
} from "../api/auth.api";

// UI Components (shadcn/ui)
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
  });

  // Resetear el formulario al cambiar de pestaña (spec 4.1)
  useEffect(() => {
    reset();
    setApiError(null);
  }, [activeTab, reset]);

  const onSubmit = async (data) => {
    setApiError(null);
    setIsLoading(true);

    try {
      let response;
      if (activeTab === "login") {
        response = await loginService({
          email: data.email,
          password: data.password,
        });
      } else {
        response = await registerService({
          name: data.name,
          email: data.email,
          password: data.password,
        });
      }

      if (response.success) {
        setSession(response.data.user, response.data.token);
        // Redirección basada en rol
        navigate(response.data.user.role === "admin" ? "/users" : "/profile");
      }
    } catch (error) {
      // Manejo de error de API (spec 8 - Tipo 2)
      const message =
        error.response?.data?.error?.message ||
        "Error de conexión con el servidor";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Tabs
          defaultValue="login"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>

          {/* ----- MODO LOGIN ----- */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresá tus credenciales para acceder al sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ana@ejemplo.com"
                      {...register("email", {
                        required: "El email es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      type="password"
                      {...register("password", {
                        required: "La contraseña es requerida",
                      })}
                    />
                    {errors.password && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {apiError && (
                    <div className="p-3 text-sm font-medium border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                      ⚠ {apiError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Iniciar sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----- MODO REGISTRO ----- */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Nueva Cuenta</CardTitle>
                <CardDescription>
                  Completá los datos para registrarte.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre completo</Label>
                    <Input
                      id="reg-name"
                      placeholder="Ana García"
                      {...register("name", {
                        required: "El nombre es requerido",
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="ana@ejemplo.com"
                      {...register("email", {
                        required: "El email es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      {...register("password", {
                        required: "La contraseña es requerida",
                        minLength: { value: 8, message: "Mínimo 8 caracteres" },
                        validate: {
                          hasUpper: (v) =>
                            /[A-Z]/.test(v) || "Debe tener una mayúscula",
                          hasLower: (v) =>
                            /[a-z]/.test(v) || "Debe tener una minúscula",
                          hasNumber: (v) =>
                            /[0-9]/.test(v) || "Debe tener un número",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      {...register("confirmPassword", {
                        required: "Debés confirmar la contraseña",
                        validate: (v) =>
                          v === watch("password") ||
                          "Las contraseñas no coinciden",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm font-medium text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {apiError && (
                    <div className="p-3 text-sm font-medium border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                      ⚠ {apiError}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Crear cuenta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
