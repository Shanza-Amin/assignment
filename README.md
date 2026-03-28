# 🧑‍💻 Recruiter Dashboard (GraphQL + React)

A lightweight recruiter-facing dashboard built using **React + Vite** that integrates with a real **GraphQL API**.  
It provides a clear overview of project candidates, projects, and candidate data with search, filtering, sorting, and pagination.

---

## 🚀 Features

- ✅ Real GraphQL API integration (no mock data)
- 📊 Summary metrics (projects, candidates, project candidates)
- 🔍 Search (by candidate ID or project name)
- 🎯 Status-based filtering
- ↕️ Column sorting (with direction indicators)
- 📄 Client-side pagination
- 🔄 Manual refresh
- ⏳ Loading, empty, and error states
- 🎨 Clean, responsive UI

---

## 🧠 Technical Highlights

- Modular architecture:
  - `components/` → UI components
  - `services/` → API logic
  - `hooks/` → reusable logic (debounce)
- Efficient rendering using `useMemo`
- Debounced search for performance optimization
- Defensive API handling:
  - Handles malformed/partial responses
  - Supports partial data rendering
- Stable data fetching:
  - Single orchestrated GraphQL request
  - Avoids race conditions and redundant API calls

---

## 🛠️ Tech Stack

- **React 18**
- **Vite**
- **GraphQL (via fetch API)**
- **Plain CSS**

---

## 📂 Project Structure
