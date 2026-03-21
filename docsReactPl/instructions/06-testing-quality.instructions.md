---
applyTo: "src/**/*.{ts,tsx}"
---
# Testing And Quality Rules

- Testy sa czescia kazdej zmiany, nie krokiem opcjonalnym.
- Pokryj testami:
  - logike biznesowa,
  - warstwe mapowania danych,
  - kluczowe interakcje uzytkownika.
- Preferuj testy zachowania nad testami implementacji.
- Stubuj backend przez MSW lub rownowazny mechanizm.
- Dla krytycznych ekranow utrzymuj test integracyjny.

## Quality Gates

- Brak bledow lint.
- Brak bledow typecheck.
- Testy przechodza lokalnie.
- Krytyczne flow nie maja regresji.
