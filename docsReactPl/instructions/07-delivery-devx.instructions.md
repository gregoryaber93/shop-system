---
applyTo: "**/*"
---
# Delivery And Dev Workflow Rules

- Dziel duze zadania na male, niezalezne PR-y.
- W opisie PR podawaj: cel, zakres, ryzyko, plan rollback.
- Kazda zmiana powinna byc latwa do recenzji i szybkiego cofniecia.
- Aktualizuj dokumentacje techniczna, gdy zmienia sie API lub architektura UI.
- Wprowadzaj feature flagi tam, gdzie ryzyko wdrozenia jest wysokie.

## Prompting Pattern

Uzywaj stalego wzorca zadan do Copilota:
1. Kontekst funkcjonalny i techniczny.
2. Dokladny wynik oczekiwany.
3. Ograniczenia i standardy.
4. Lista testow i warunkow akceptacji.

## Wspolpraca zespolowa

- Ujednolic nazewnictwo i strukture plikow.
- Nie mieszaj refactoringu z nowa funkcjonalnoscia bez potrzeby.
- Decyzje architektoniczne zapisuj krotkim ADR w docs.
