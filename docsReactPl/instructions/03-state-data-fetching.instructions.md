---
applyTo: "src/**/*.{ts,tsx}"
---
# State And Data Fetching Rules

- Rozdziel server state od client state.
- Dla server state preferuj React Query (lub rownowazny mechanizm).
- Dla local state uzywaj `useState`/`useReducer`; global state tylko gdy potrzebny.
- Definiuj stale query key i nie duplikuj ich miedzy modulami.
- Konfiguruj cache i staleTime zgodnie z charakterem danych.
- Obsluguj race condition i anulowanie zapytan.

## UX danych

- Pokazuj loading skeleton zamiast migania spinnera przy kazdym odswiezeniu.
- Dla bledow zapewnij mozliwosc retry.
- Dla pustych danych stosuj czytelny empty state z CTA.
