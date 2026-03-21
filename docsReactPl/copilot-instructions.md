# Global React Frontend Instructions

Pracujesz nad nowoczesna aplikacja React + TypeScript dla platformy opartej o mikroserwisy.

## Priorytety

1. Poprawnosc biznesowa i zgodnosc z kontraktami API.
2. Czytelnosc i prostota rozwiazania.
3. Bezpieczenstwo i odpornosc na bledy.
4. Performance i UX.
5. Testowalnosc i utrzymywalnosc.

## Zasady globalne

- Uzywaj TypeScript strict i unikaj `any`.
- Buduj modularnie: feature-first, nie "wszystko w jednym".
- Kazdy ekran musi obslugiwac loading, empty, error, success.
- Kazde wywolanie API musi miec timeout, obsluge bledow i mapowanie na czytelny komunikat UI.
- Waliduj dane wejsciowe i odpowiedzi serwera (np. Zod).
- Wprowadzaj zmiany malymi krokami, z testami.
- Nie duplikuj logiki - preferuj wspolne hooki i utility.

## Standard implementacji zmian

Dla kazdej zmiany Copilot powinien zwrocic:
- Plan krokow.
- Kod implementacji.
- Testy.
- Krotkie podsumowanie ryzyk i decyzji technicznych.

## Integracja z backendami

- Traktuj kontrakt API jako zrodlo prawdy.
- Wydziel warstwe klienta API od komponentow.
- Uzywaj DTO i mapperow do modelu UI.
- Nie mieszaj logiki transportowej (HTTP) z logika prezentacji.

## Jakosc

- Lint + format + typecheck musza przechodzic.
- Kluczowe flow biznesowe musza miec testy.
- Nie wprowadzaj breaking changes bez wyraznego uzasadnienia.

## Architektura promptow

Gdy wykonujesz zadanie, pracuj wedlug schematu:
- Kontekst: ekran/feature i zaleznosci backendowe.
- Cel: co ma dzialac po zmianie.
- Ograniczenia: standardy, edge case, performance, security.
- Output: kod + testy + checklista weryfikacji.
