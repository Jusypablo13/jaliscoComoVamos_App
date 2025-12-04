# App Jalisco Cómo Vamos

## 📖 Contexto del Proyecto

### Observatorio Jalisco Cómo Vamos
El **Observatorio Jalisco Cómo Vamos** es una iniciativa ciudadana que busca generar información confiable y pertinente sobre la calidad de vida en Jalisco. Su objetivo es monitorear indicadores clave y promover la participación ciudadana para incidir en la toma de decisiones públicas.

### Encuesta de Percepción Ciudadana
Esta aplicación móvil está diseñada para visualizar y analizar los datos recabados en la **Encuesta de Percepción Ciudadana**. Esta encuesta recoge la opinión de los habitantes sobre diversos temas fundamentales para el bienestar social, tales como:
- Seguridad
- Servicios públicos
- Movilidad
- Medio ambiente
- Gobierno y participación

La aplicación permite a los usuarios explorar estos datos de manera interactiva, facilitando el acceso a la información y fomentando una ciudadanía más informada.

---

## 📱 Desarrollo de la Aplicación Móvil

Esta aplicación ha sido desarrollada utilizando tecnologías modernas para el desarrollo móvil multiplataforma, asegurando un rendimiento óptimo tanto en iOS como en Android.

### Arquitectura y Tecnologías

El proyecto está construido sobre el ecosistema de **React Native** gestionado con **Expo**, lo que permite un ciclo de desarrollo ágil y una distribución eficiente.

#### Stack Tecnológico Principal:

- **Framework**: [React Native](https://reactnative.dev/) (v0.81.5) - Para la construcción de la interfaz nativa utilizando React.
- **Plataforma**: [Expo](https://expo.dev/) (SDK 54) - Herramientas y servicios para facilitar el desarrollo, construcción y despliegue.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) - Para un código más robusto, seguro y mantenible.
- **Navegación**: [React Navigation](https://reactnavigation.org/) (v7) - Gestión de rutas y navegación entre pantallas (Stack y Tabs).
- **Backend & Base de Datos**: [Supabase](https://supabase.com/) - Plataforma BaaS (Backend as a Service) que provee:
  - Base de datos PostgreSQL en tiempo real.
  - Autenticación de usuarios.
  - Almacenamiento seguro.

#### Librerías Clave:

- **Visualización de Datos**: `react-native-chart-kit` y `react-native-svg` para la generación de gráficas estadísticas interactivas.
- **Almacenamiento Local**: `expo-secure-store` para guardar información sensible (como tokens de sesión) de forma segura.
- **Manejo de Archivos**: `expo-file-system`, `expo-print`, `expo-sharing` para la generación y exportación de reportes.

---

## 🚀 Instalación y Configuración

Para ejecutar este proyecto localmente, asegúrate de tener instalado [Node.js](https://nodejs.org/) y el entorno de desarrollo configurado.

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd app_jalisco_como_vamos
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto (basado en `.env.local` si existe) y configura tus credenciales de Supabase:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
    ```

4.  **Ejecutar la aplicación:**
    ```bash
    npx expo start
    ```
    - Presiona `a` para abrir en Android Emulator.
    - Presiona `i` para abrir en iOS Simulator.
    - Escanea el código QR con la app **Expo Go** en tu dispositivo físico.

---

## 🔒 Seguridad y Buenas Prácticas

El desarrollo de esta aplicación sigue prácticas de seguridad estándar:
- **Autenticación Segura**: Uso de tokens persistentes manejados por `expo-secure-store`.
- **Protección de Datos**: Comunicación encriptada con Supabase y uso de Row Level Security (RLS) en la base de datos para restringir el acceso a la información.
- **Tipado Estático**: Uso extensivo de TypeScript para prevenir errores en tiempo de ejecución.

---