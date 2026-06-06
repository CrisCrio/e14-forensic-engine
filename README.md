# E-14 Forensic Engine 🗳️

Sistema de monitoreo y auditoría electoral que detecta fraude en formularios E-14 comparando los votos reportados contra la capacidad registrada de cada mesa de votación.

---

## 📋 Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Expo Go](https://expo.dev/client) instalado en tu dispositivo móvil
- Cuenta en [Supabase](https://supabase.com/) con las tablas configuradas

---

## 🗄️ Configuración de Supabase

### 1. Crear las tablas

En el **SQL Editor** de tu panel de Supabase, ejecuta:

```sql
-- Tabla de mesas de votación
CREATE TABLE polling_tables (
  table_number INTEGER PRIMARY KEY,
  registered_voters INTEGER
);

-- Tabla de formularios E-14
CREATE TABLE e14_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER REFERENCES polling_tables(table_number),
  candidate_a_votes INTEGER,
  candidate_b_votes INTEGER,
  blank_votes INTEGER,
  null_votes INTEGER
);

-- Deshabilitar RLS y dar acceso público
ALTER TABLE polling_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE e14_forms DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON polling_tables TO anon;
GRANT SELECT ON e14_forms TO anon;
```

### 2. Insertar datos de ejemplo

```sql
-- Mesas de votación
INSERT INTO polling_tables (table_number, registered_voters) VALUES
(1, 100), (2, 125), (3, 200), (4, 148), (5, 220);

-- Formularios E-14 (mesas 2 y 4 tienen fraude intencional)
INSERT INTO e14_forms (table_id, candidate_a_votes, candidate_b_votes, blank_votes, null_votes) VALUES
(1, 25, 40, 35, 5),    -- OK: 105 > 100 ⚠
(2, 25, 50, 40, 10),   -- FRAUDE: 125 = 125
(3, 70, 75, 25, 30),   -- OK: 200 = 200
(4, 55, 45, 42, 6),    -- FRAUDE: 148 = 148
(5, 95, 100, 30, 0);   -- OK: 225 > 220 ⚠
```

---

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/e14-forensic-engine.git
cd e14-forensic-engine
```

### 2. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### 3. Configurar credenciales de Supabase

Abre `src/utils/supabaseClient.js` y reemplaza con tus credenciales:

```javascript
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
```

> Encuéntralas en Supabase → **Settings → API → Project API keys**

---

## ▶️ Ejecutar la app

```bash
npx expo start
```

Escanea el QR con **Expo Go** desde tu dispositivo móvil.

---

## 🧪 Ejecutar los tests

```bash
npx jest src/utils/e14Auditor.test.js --verbose
```

### Resultado esperado
PASS src/utils/e14Auditor.test.js
calculateTotalVotes
√ suma correctamente todos los votos
√ retorna 0 si todos los votos son 0
isFraudulent
√ detecta fraude cuando votos superan capacidad
√ no marca fraude cuando votos están dentro del límite
√ no marca fraude cuando votos son exactamente iguales a la capacidad
Integración con Supabase
√ fetchPollingData retorna un array con datos
√ cada registro tiene la estructura esperada
√ detecta al menos 2 mesas fraudulentas
√ muestra las mesas fraudulentas
Tests: 9 passed, 9 total

---

## 🐳 Docker

### Construir y correr tests en contenedor

```bash
docker compose build
docker compose run --rm expo-app npm test
```

---

## 📁 Estructura del proyecto
e14-forensic-engine/
├── App.js                        # Interfaz terminal hacker
├── Dockerfile                    # Configuración Docker
├── docker-compose.yml            # Orquestación de contenedores
├── jest.setup.js                 # Polyfill fetch para Jest
├── package.json                  # Dependencias y configuración Jest
├── README.md                     # Este archivo
└── src/
└── utils/
├── supabaseClient.js     # Conexión a Supabase
├── e14Auditor.js         # Lógica de auditoría
└── e14Auditor.test.js    # Tests forenses

---

## 🔍 ¿Cómo funciona?

El algoritmo es simple: para cada mesa de votación, suma todos los votos reportados en el formulario E-14:
Total = Candidato A + Candidato B + Blancos + Nulos

Si `Total > Votantes registrados` → **FRAUDE DETECTADO** ⚠️

---

## 🛠️ Tecnologías

- [Expo](https://expo.dev/) / React Native
- [Supabase](https://supabase.com/) — Base de datos PostgreSQL en la nube
- [Jest](https://jestjs.io/) + [jest-expo](https://www.npmjs.com/package/jest-expo) — Testing