# React + TypeScript Copilot Instructions Pack

Ten katalog zawiera gotowy pakiet instrukcji do pracy z GitHub Copilot nad frontendem React + TypeScript dla tego systemu mikroserwisow.

Celem jest:
- ujednolicenie sposobu generowania kodu,
- szybsza i bezpieczniejsza integracja z backendami,
- podzial pracy na mniejsze, niezalezne obszary,
- utrzymanie wysokiej jakosci bez dlugu technicznego.

## Co jest w pakiecie

- `copilot-instructions.md` - glowny plik zasad globalnych.
- `instructions/*.instructions.md` - instrukcje szczegolowe, podzielone na obszary.

## Jak tego uzywac

1. Skopiuj `docsReactPl/copilot-instructions.md` do `.github/copilot-instructions.md`.
2. Skopiuj folder `docsReactPl/instructions` do `.github/instructions`.
3. W repo otworz zadanie frontendowe i pracuj iteracyjnie: plan -> implementacja -> testy -> poprawki.
4. Gdy Copilot generuje kod, zawsze odwoluj sie do konkretnego obszaru instrukcji (np. API, testy, UI).

## Rekomendowany workflow

1. Zacznij od kontraktu API i scenariuszy uzytkownika.
2. Popros Copilota o szkielet funkcji i folderow.
3. Implementuj pionowo, malymi porcjami (ekran + dane + walidacja + test).
4. Po kazdej porcji uruchom lint, typecheck i testy.
5. Scalaj zmiany dopiero po spelnieniu Definition of Done.

## Najwazniejsze praktyki optymalizacji pracy

- Tworz male prompty z kontekstem: cel, ograniczenia, expected output.
- Pracuj na gotowych wzorcach (hook API, schema Zod, komponent formularza, test).
- Wymagaj od Copilota pelnych zmian: kod + test + aktualizacja typow + notatka co zmieniono.
- Nie akceptuj kodu bez obslugi bledow, loading state i testu krytycznej logiki.
- Priorytetyzuj czytelnosc i maintainability ponad "sprytne" skroty.

## Definition of Done dla kazdego zadania UI

- Typy TypeScript sa scisle, bez `any`.
- API ma walidacje input/output.
- Ekran ma loading, empty, error, success state.
- Dostepnosc: focus, aria-label gdzie trzeba, kontrast i nawigacja klawiatura.
- Testy jednostkowe i minimum jeden scenariusz integracyjny.
- Brak nowych bledow lint/typecheck.

## Utrzymanie pakietu

- Aktualizuj instrukcje po wiekszych zmianach architektury.
- Dodawaj nowe pliki `.instructions.md`, gdy pojawia sie nowy obszar pracy.
- Usuwaj lub poprawiaj zasady, ktore generuja niepotrzebny narzut.
