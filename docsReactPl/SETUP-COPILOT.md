# Jak Używać React Instructions w Visual Studio Code z Copilot

Praktyczny poradnik dla pierwszego użytkownika.

---

## CZĘŚĆ 1: PRZYGOTOWANIE (5 minut)

### Krok 1: Otwórz VS Code z Twoim Projektem

1. **Otwórz Visual Studio Code** (jeśli masz go zainstalowany).
2. **Otwórz folder projektu**:
   - Menu: `File` → `Open Folder`
   - Wybierz folder gdzie będziesz robić frontend (np. `my-shop-frontend`)

```
📁 my-shop-frontend/
   ├── src/
   ├── package.json
   └── ...
```

### Krok 2: Skopiuj Instrukcje do Projektu

Te instrukcje muszą być w Twoim repozytorium, aby Copilot je widział.

1. **Utwórz strukturę katalogów**:
   - Klikaj prawy guzik myszy na folder projektu w VS Code
   - Wybierz `New Folder`
   - Wpisz: `.github`
   - Wciśnij Enter

2. **Wewnątrz `.github` utwórz folder** `instructions`:
   - Prawy guzik na `.github` → `New Folder`
   - Wpisz: `instructions`
   - Wciśnij Enter

3. **Skopiuj pliki instrukcji**:
   - Otwórz explorer (ten okno z folderami po lewej stronie VS Code)
   - Przeciągnij pliki z `docsReactPl/instructions/` (linie 01-17) do `.github/instructions/`
   - Również skopiuj:
     - `docsReactPl/copilot-instructions.md` → `.github/`
     - `docsReactPl/QUICK-START.md` → `.github/`
     - `docsReactPl/FEATURE-SEQUENCE.md` → `.github/`

**Rezultat powinien wyglądać tak:**

```
📁 my-shop-frontend/
   ├── src/
   ├── .github/
   │   ├── copilot-instructions.md
   │   ├── QUICK-START.md
   │   ├── FEATURE-SEQUENCE.md
   │   └── instructions/
   │       ├── 01-architecture.instructions.md
   │       ├── 02-api-integration.instructions.md
   │       ├── ...
   │       └── 17-performance-and-caching-strategies.instructions.md
   ├── package.json
   └── ...
```

### Krok 3: Zainstaluj Copilota (jeśli jeszcze go nie masz)

1. **Kliknij ikonę rozszerzeń** (Extensions) po lewej stronie (wygląda jak kwadraty):

```
[Extensions icon - cztery małe kwadraty]
```

2. **Wpisz w search box**: `GitHub Copilot`
3. **Kliknij pierwszy wynik** (oficjalny extension od GitHub)
4. **Kliknij `Install`** (zielony guzik)
5. **Poczekaj aż się zainstaluje**
6. **Zaloguj się** do GitHub konta (będzie prośba aby się zalogować)

✅ Gotowe! Copilot jest zainstalowany.

---

## CZĘŚĆ 2: NAJPIERW - PRZECZYTAJ INSTRUKCJE (10 minut)

### Krok 4: Znajomość Materiału

Zanim zaczniesz pisać kod, przeczytaj te pliki:

1. **W VS Code**, otwórz `.github/copilot-instructions.md`:
   - Kliknij na plik w explorze
   - Przeczytaj **Global React Frontend Instructions** - to są główne reguły

2. **Przeczytaj** `.github/QUICK-START.md`:
   - To jest 15 kroków "od zera do działającej aplikacji"
   - Wyjaśnia jakie biblioteki zainstalować, jak strukturyzować folder

3. **Przeczytaj** `.github/FEATURE-SEQUENCE.md`:
   - To jest plan 7 sprintów na 17 dni
   - Pokazuje w jakim porządku robić features

### Co Ty Będziesz Robić?

Zdecydujesz się na **feature** do implementacji. Na przykład:

- Sprint 1 (Dni 1-3): **Autentykacja** (login/register)
- Sprint 2 (Dni 4-6): **Produkty** (wyświetlanie produktów)
- Sprint 3 (Dni 7-9): **Koszyk** (dodawanie do koszyka)

---

## CZĘŚĆ 3: KONWERSACJA Z COPILOT (Praktyka)

### Krok 5: Otwórz Copilot Chat

1. **Kliknij ikonę Copilota** po lewej stronie (ikona podobna do rozmowy):

```
[Copilot Chat icon - wygląda jak myśl bąbelka]
```

**Lub skrót klawiszowy**: `Ctrl+Shift+I` (Windows)

Otworzy się panel po lewej stronie gdzie możesz rozmawiać z Copilot.

### Krok 6: Pierwszy Prompt - Plan Projektu

W polu tekstowym na dole napiszesz **prompt** (pytanie dla Copilota).

**Wciśnij** w pole tekstowe i wpisz:

```
Buduję frontend React + TypeScript dla systemu mikroserwisów.
Patrzę na .github/FEATURE-SEQUENCE.md i chcę zacząć od Sprint 1 (Autentykacja).

Na podstawie .github/instructions/08-authentication-and-jwt.instructions.md:
- Utwórz strukturę folderów projektu
- Stwórz AuthContext
- Utwórz strony login i register
- Skonfiguruj obsługę JWT

Możesz stworzyć plan krok po kroku dla implementacji autentykacji?
```

**Kliknij** `Enter` lub `Send` button (strzałka po prawej).

---

## CZĘŚĆ 4: KONKRETNE ZADANIE - Implementacja

### Krok 7: Prosisz Copilota o Kod

Teraz dajesz mu **konkretne zadanie** z instrukcji.

**W polu chat wpisz:**

```
Utwórz src/features/auth/context/AuthContext.tsx używając wzorca z 
.github/instructions/08-authentication-and-jwt.instructions.md:

Wymagania:
- AuthContext z właściwościami: token, userId, roles, isLoggedIn
- Funkcja login() która wywołuje API i przechowuje JWT
- Funkcja logout()
- Hook useAuth() do użycia w komponentach

Włącz TypeScript types i localStorage persistence.
```

**Wciśnij Enter**.

Copilot **wygeneruje kod** w chacie. Przykład:

```typescript
interface AuthContextType {
  token: string | null;
  userId: string | null;
  roles: string[];
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
// ... reszta kodu
```

### Krok 8: Skopiuj kod do pliku

1. **W chacie Copilota**, nad kodem zobaczysz guzik `Copy` (znaczek schowka)
2. **Kliknij `Copy`** - kod jest teraz w schowku
3. **W VS Code Explorer**, utwórz folder strukturę:
   - Prawy guzik na `src/` → `New Folder` → wpisz `features`
   - Prawy guzik na `src/features/` → `New Folder` → wpisz `auth`
   - Prawy guzik na `src/features/auth/` → `New Folder` → wpisz `context`
   - Prawy guzik na `src/features/auth/context/` → `New File` → wpisz `AuthContext.tsx`

4. **Otwórz** `AuthContext.tsx` (klikaj na plik)
5. **Wklej kod**: `Ctrl+V`
6. **Zapisz plik**: `Ctrl+S`

✅ Masz pierwszy plik!

---

## CZĘŚĆ 5: Rozwijanie - Dodaj API Client

### Krok 9: Prosisz o API Client

Copilot i instrukcje pracują razem. Prosisz o **kolejny komponent**.

**W polu chat wpisz:**

```
Teraz utwórz src/features/auth/api/authClient.ts dla logowania i rejestracji.

Z .github/instructions/08-authentication-and-jwt.instructions.md:
- Stwórz funkcję login(email, password) która wywołuje POST /api/authentication/login
- Stwórz funkcję register(email, password, role?) która wywołuje POST /api/authentication/register
- Oba zwracają { token: string }
- Użyj axios z baseURL z zmiennych środowiskowych

Użyj TypeScript strict, bez 'any' typów.
```

**Enter** → Copilot generuje kod → **Copy** → utwórz `src/features/auth/api/authClient.ts` → **Paste** → **Save**.

---

## CZĘŚĆ 6: Testing

### Krok 10: Pytaj o Testy

Instrukcje mówią że każdy kod musi mieć test. Pytasz Copilota:

**W chacie:**

```
Utwórz test dla flow logowania używając MSW (Mock Service Worker).

Plik: src/features/auth/tests/authFlow.test.tsx

Z .github/instructions/16-integration-testing-scenarios.instructions.md - Scenario 1:
- Mock endpoint /api/authentication/login
- Test że użytkownik może się zalogować i JWT jest przechowywany w localStorage
- Test że role użytkownika są dekodowane z JWT

Użyj vitest i React Testing Library.
```

**Enter** → Copilot generuje test → Copy → utwórz folder `src/features/auth/tests/` → plik `authFlow.test.tsx` → Paste → Save.

---

## CZĘŚĆ 7: Ciągłość - Następny Feature

### Krok 11: Przechodzisz do Następnego Feature

Gdy skończyłeś Authentication, przechodzisz do Products (Sprint 2).

**Czytasz**:
- `.github/instructions/09-products-listing-and-caching.instructions.md`
- `.github/FEATURE-SEQUENCE.md` → Sprint 2 sekcja

**W chacie Copilota:**

```
Implementuj wyświetlanie produktów używając .github/instructions/09-products-listing-and-caching.instructions.md:

Stwórz:
1. src/features/products/api/productClient.ts - API client z metodą getAll()
2. src/features/products/hooks/useAllProducts.ts - React Query hook z caching
3. src/features/products/ui/ProductList.tsx - Komponent listy z loading/error/empty states
4. src/features/products/ui/ProductCard.tsx - Komponent karty dla jednego produktu

Użyj React Query ze staleTime: 5min, gcTime: 30min
```

I ciąg dalszy...

---

## CZĘŚĆ 8: Ważne Skróty Klawiszowe

| Skrót | Co robić |
|-------|----------|
| `Ctrl+Shift+I` | Otwórz Copilot Chat |
| `Ctrl+S` | Zapisz plik |
| `Ctrl+Shift+P` | Paleta poleceń (search po komendach) |
| `Ctrl+J` | Otwórz Terminal (niżej) |
| `Alt+Z` | Toggle word wrap (zawijanie tekstu) |
| `Ctrl+/` | Comment/uncomment linia |

---

## PRZYKŁADOWE PROMPTY - Szablony

Tutaj masz szablony promptów które możesz copy-paste i dostosować:

### Template 1: Nowy Komponent UI

```
Utwórz [ŚCIEŻKA_PLIKU] na podstawie .github/instructions/[NUMER]-[INSTRUKCJA].instructions.md:

Wymagania:
- [Wymaganie 1]
- [Wymaganie 2]
- [Wymaganie 3]

Musi zawierać:
- TypeScript strict types (bez 'any')
- Obsługę błędów
- Loading state
- Stylowanie przy użyciu [CSS Framework]
```

### Template 2: Hook Custom

```
Utwórz [HOOK_PATH] jako React Query hook na podstawie [INSTRUKCJA_FILE]:

API:
- Endpoint: [GET/POST /api/...]
- Request: [struktura pól]
- Response: [struktura]

Hook powinien:
- Użyć useQuery ze staleTime: [X], gcTime: [Y]
- Obsługiwać loading/error/data states
- Zawierać obsługę błędów
```

### Template 3: Test Integracyjny

```
Utwórz test integracyjny dla [FEATURE_NAME] używając MSW:

Z .github/instructions/16-integration-testing-scenarios.instructions.md:

Test powinien pokrywać:
1. [Happy path scenario]
2. [Error scenario]
3. [Edge case]

Użyj vitest + React Testing Library + MSW.
```

---

## CZĘŚĆ 9: Poradnik Gdy Jest Problem

### Copilot nie widzi instrukcji?

**Problem**: Copilot generuje kod który nie zgadza się z instrukcjami.

**Rozwiązanie**:
1. W prompt wyraźnie cytuj ścieżkę: `.github/instructions/08-...md`
2. Dodaj **cytat** z instrukcji do prompta:

```
Patrzę na .github/instructions/08-authentication-and-jwt.instructions.md:

"JWT jest walidowany przez backend przy każdym zapytaniu."

Proszę upewnij się że każde API call zawiera Authorization header...
```

### Kod ma błędy TypeScript?

**Problem**: Po wklejeniu kodu, VS Code pokazuje czerwone linijki (errory).

**Rozwiązanie**:
1. **Otwórz Terminal** (View → Terminal lub Ctrl+`) w VS Code
2. **Zainstaluj dependencies**:

```bash
npm install
```

3. **Uruchom type check**:

```bash
npm run type-check
```

4. **Jeśli jest błąd**, skopiuj błąd i pytaj Copilota:

```
Otrzymuję ten błąd TypeScript:

[wklej błąd z terminala]

Możesz naprawić [PLIK] aby rozwiązać ten problem?
```

### Test nie przechodzi?

**W Terminal**:

```bash
npm run test
```

Jeśli test padł, skopiuj błąd do Copilota:

```
Mój test nie przechodzi:

[output z terminala]

Jak naprawić test w [TEST_PLIK]?
```

---

## CZĘŚĆ 10: Daily Workflow

Typowy dzień pracy:

```
09:00 - Otwierasz VS Code
09:05 - Czytasz .github/FEATURE-SEQUENCE.md - sprawdzasz co robić dzisiaj
09:10 - Otwierasz relevantną instrukcję (08-17)
09:15 - Otwierasz Copilot Chat (Ctrl+Shift+I)
09:20 - Piszesz prompt z wymaganiami i ścieżką do instrukcji
09:25 - Copilot generuje kod
09:30 - Kopiujesz kod do pliku
09:35 - Zapisujesz plik (Ctrl+S)
10:00 - Robisz test
10:15 - Testujesz w przeglądarce (npm run dev)
10:30 - Jeśli OK → przechodzisz do następnego komponentu
       Jeśli błąd → pytasz Copilota jak naprawić
11:30 - Koniec pracy, commit zmiany (git commit)
```

---

## CHECKLIST - Zanim Zaczniesz

- [ ] VS Code zainstalowany
- [ ] Folder projektu otwarty w VS Code
- [ ] `.github/` folder z instrukcjami skopiowany
- [ ] Copilot Extension zainstalowany
- [ ] Zalogowany w GitHub (Copilot)
- [ ] Przeczytałeś `.github/copilot-instructions.md`
- [ ] Przeczytałeś `.github/QUICK-START.md`
- [ ] Przeczytałeś `.github/FEATURE-SEQUENCE.md` - wiesz co robić najpierw

✅ Jesteś gotowy!

---

## Lekkie Pytania?

Jeśli coś nie jasne:

1. **Pytaj Copilota** - on jest bardzo pomocny dla nowoprzybyłych
2. **Odwołaj się do instrukcji** - zawsze są przykłady
3. **Czytaj błędy** - TypeScript i VS Code dają ci wskazówki

**Przykład pytania do Copilota**:

```
Jestem nowy w React. Jak działa hook useAuth z 
.github/instructions/08-authentication-and-jwt.instructions.md?
Możesz wyjaśnić mi wzorzec AuthContext krok po kroku?
```

Copilot wyjaśni ci dokładnie!

---

## Następny Krok: Obejrzyj Tutorial

Jeśli chcesz video tutorial o Copilot:
- YouTube: "GitHub Copilot tutorial React" 
- Official: https://docs.github.com/en/copilot

Ale **te instrukcje wystarczą** dla twojego projektu!

**Powodzenia! 🚀**
