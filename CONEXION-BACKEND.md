# Conectar el frontend con tu backend en Render

## 1. URL del backend (variables de entorno)

El frontend usa **Vite** y lee la URL del backend desde la variable de entorno `VITE_API_URL`.

**En desarrollo (local):**
- Crea un archivo `.env` en la raíz del proyecto (o copia `.env.example`).
- Añade: `VITE_API_URL=https://droclven-back.onrender.com`
- Reinicia `npm run dev` si ya estaba corriendo.

**En Vercel (producción):**
1. Entra en tu proyecto en [vercel.com](https://vercel.com).
2. Ve a **Settings** → **Environment Variables**.
3. Añade: `VITE_API_URL` = `https://droclven-back.onrender.com`
4. Redespliega el proyecto.

---

## 2. Estructura del proyecto (Vite + React)

```
src/
├── components/       # Componentes reutilizables
│   ├── Header.jsx
│   ├── Nav.jsx
│   ├── Hero.jsx
│   ├── Categories.jsx
│   ├── Brands.jsx
│   ├── Distribuye.jsx
│   └── Footer.jsx
├── pages/            # Páginas
│   └── HomePage.jsx
├── config/           # Configuración y API
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 3. CORS en el backend (Render)

El backend debe permitir peticiones desde tu frontend en Vercel (y localhost para desarrollo).

**Ejemplo en Express (Node):**

```js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://tu-proyecto.vercel.app',
    'http://localhost:5173',   // Vite usa 5173 por defecto
    'http://127.0.0.1:5173'
  ]
}));
```

---

## 4. Usar la API en componentes

Importa las funciones desde `src/config/api.js`:

```js
import { apiGet, apiPost } from '../config/api'

// GET
const categorias = await apiGet('/api/categorias')

// POST
await apiPost('/api/contacto', { nombre, email, mensaje })
```

---

## 5. Comandos

| Comando | Descripción |
|--------|-------------|
| `npm install` | Instalar dependencias |
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Generar build para producción |
| `npm run preview` | Previsualizar el build |
