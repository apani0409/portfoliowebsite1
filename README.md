# Portfolio - Alessandro Pani

Portfolio personal desarrollado con Gatsby, React, TypeScript, Tailwind CSS y Three.js.

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Clona el repositori
```bash
git clone <url-del-repositorio>
cd portfoliowebsite1
```

2. Instala las dependencias:
```bash
npm install
```

3. (Opcional) Actualiza la base de datos de navegadores:
```bash
npx update-browserslist-db@latest
```

### Desarrollo

Inicia el servidor de desarrollo:
```bash
npm run dev
```

El sitio estará disponible en:
- **Sitio web**: http://localhost:8000/
- **GraphiQL IDE**: http://localhost:8000/___graphql

### Construcción para Producción

Construye el sitio optimizado para producción:
```bash
npm run build
```

### Servidor de Producción Local

Sirve la versión de producción localmente:
```bash
npm run serve
```

### Otros Comandos

- **Limpiar caché**: `npm run clean`
- **Verificar tipos**: `npm run typecheck`

## 🛠️ Tecnologías

- **Framework**: Gatsby 5
- **UI**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + SASS
- **3D**: Three.js + React Three Fiber
- **Animaciones**: Framer Motion + GSAP
- **Otros**: Chess.js, React Chessboard

## 📁 Estructura del Proyecto

```
portfoliowebsite1/
├── src/
│   ├── components/     # Componentes React
│   ├── context/        # Context API
│   ├── data/           # JSON data (experiencias, proyectos)
│   ├── images/         # Imágenes
│   ├── pages/          # Páginas de Gatsby
│   ├── styles/         # Estilos SCSS
│   └── util/           # Utilidades
├── static/             # Archivos estáticos
├── gatsby-config.ts    # Configuración de Gatsby
├── tailwind.config.js  # Configuración de Tailwind
└── package.json        # Dependencias
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.development` en la raíz del proyecto para variables de entorno de desarrollo.

## 🔧 Solución de Problemas

### Advertencias Comunes

Si ves advertencias sobre vulnerabilidades de npm:
```bash
npm audit fix
```

Si hay problemas con el caché de Gatsby:
```bash
npm run clean
```

## 📝 Notas

- El sitio usa dark mode con Tailwind CSS
- Incluye componentes responsive para móvil y desktop
- Integra un motor de ajedrez con chess.js
- Animaciones 3D con Three.js

## 👨‍💻 Autor

Alessandro Pani

## 📄 Licencia

Este proyecto es privado.