---
applyTo: "src/**/*.{ts,tsx}"
---
# Security And Performance Rules

- Nie uzywaj `dangerouslySetInnerHTML` bez twardego uzasadnienia i sanitizacji.
- Nie przechowuj wrazliwych danych w localStorage, jesli nie jest to konieczne.
- Ograniczaj wielkosc bundle: lazy loading, code splitting, tree shaking.
- Memoizuj tylko to, co realnie poprawia wydajnosc.
- Dla list stosuj wirtualizacje, gdy skala danych jest duza.
- Monitoruj Web Vitals i regresje po zmianach.

## Ochrona przed regresja

- Dla krytycznych scenariuszy mierz czas renderu i czas odpowiedzi UI.
- Unikaj niekontrolowanych rerenderow przez stabilne referencje i selektory.
