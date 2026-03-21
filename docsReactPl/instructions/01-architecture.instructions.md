---
applyTo: "src/**/*.{ts,tsx}"
---
# React Architecture Rules

- Stosuj podejscie feature-first:
  - `src/features/<feature-name>`
  - `src/shared`
  - `src/app`
- W kazdym feature wydziel:
  - `api`
  - `model`
  - `ui`
  - `hooks`
  - `tests`
- Komponenty maja byc male i jednokrotnej odpowiedzialnosci.
- Logike biznesowa trzymaj poza komponentami prezentacyjnymi.
- Unikaj przekazywania wielu propsow przez wiele poziomow; preferuj composition i dedykowane hooki.
- Dla wiekszych funkcji tworz granice modulow i publiczny punkt wejscia.

## Wymagania dla nowych feature

- Jasna granica odpowiedzialnosci miedzy warstwa UI i data.
- Brak importow "na skroty" lamacych modularnosc.
- Wspolne typy i helpery tylko w `shared`, jesli sa faktycznie wspolne.
