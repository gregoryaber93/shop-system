---
applyTo: "src/**/*.{ts,tsx}"
---
# API Integration Rules

- Kazdy serwis backendowy obsluguj przez dedykowanego klienta API.
- Nie wykonuj `fetch`/`axios` bezposrednio w komponencie.
- Definiuj typy request/response i waliduj response schema.
- Stosuj timeout, retry (tam gdzie bezpieczne) i mapowanie bledow.
- Przekladaj bledy techniczne na komunikaty zrozumiale dla uzytkownika.
- Dla mutacji obsluguj optimistic update tylko gdy rollback jest bezpieczny.

## Kontrakt i wersjonowanie

- Zmiany kontraktu API traktuj jako osobny krok (typy, mappery, testy).
- Utrzymuj kompatybilnosc wsteczna UI tam, gdzie to mozliwe.
- Dokumentuj zaleznosci endpointow od uprawnien.

## Bezpieczenstwo

- Nie loguj tokenow i danych wrazliwych.
- Naglowki auth ustawiaj centralnie.
- Normalizuj i sanityzuj dane z zewnatrz.
