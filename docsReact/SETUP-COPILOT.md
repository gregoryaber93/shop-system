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
   - Przeciągnij pliki z `docsReact/instructions/` (linie 01-17) do `.github/instructions/`
   - Również skopiuj:
     - `docsReact/copilot-instructions.md` → `.github/`
     - `docsReact/QUICK-START.md` → `.github/`
     - `docsReact/FEATURE-SEQUENCE.md` → `.github/`

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

- Sprint 1 (Dni 1-3): **Authentication** (login/register)
- Sprint 2 (Dni 4-6): **Product Listing** (wyświetlanie produktów)
- Sprint 3 (Dni 7-9): **Shopping Cart** (dodawanie do koszyka)

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
I'm building a React + TypeScript frontend for a microservices system.
Looking at .github/FEATURE-SEQUENCE.md, I want to start with Sprint 1 (Authentication).

Based on .github/instructions/08-authentication-and-jwt.instructions.md:
- Create the project folder structure
- Set up AuthContext
- Create login and register pages
- Setup JWT token handling

Can you create a step-by-step plan for implementing authentication?
```

**Kliknij** `Enter` lub `Send` button (strzałka po prawej).

---

## CZĘŚĆ 4: KONKRETNE ZADANIE - Implementacja

### Krok 7: Prosisz Copilota o Kod

Teraz dajesz mu **konkretne zadanie** z instrukcji.

**W polu chat wpisz:**

```
Create src/features/auth/context/AuthContext.tsx using the pattern from 
.github/instructions/08-authentication-and-jwt.instructions.md:

Requirements:
- AuthContext with token, userId, roles, isLoggedIn properties
- login() function that calls API and stores JWT
- logout() function
- useAuth() hook to use it in components

Include TypeScript types and localStorage persistence.
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
Now create src/features/auth/api/authClient.ts for logging in and registering.

From .github/instructions/08-authentication-and-jwt.instructions.md:
- Create login(email, password) function that calls POST /api/authentication/login
- Create register(email, password, role?) function that calls POST /api/authentication/register
- Both return { token: string }
- Use axios with baseURL from environment

Make it TypeScript strict, no 'any' types.
```

**Enter** → Copilot generuje kod → **Copy** → utwórz `src/features/auth/api/authClient.ts` → **Paste** → **Save**.

---

## CZĘŚĆ 6: Testing

### Krok 10: Pytaj o Testy

Instrukcje mówią że każdy kod musi mieć test. Pytasz Copilota:

**W chacie:**

```
Create a test for the login flow using MSW (Mock Service Worker).

File: src/features/auth/tests/authFlow.test.tsx

From .github/instructions/16-integration-testing-scenarios.instructions.md - Scenario 1:
- Mock the /api/authentication/login endpoint
- Test that user can login and JWT is stored in localStorage
- Test that the user roles are decoded from JWT

Use vitest and React Testing Library.
```

**Enter** → Copilot generuje test → Copy → utwórz folder `src/features/auth/tests/` → plik `authFlow.test.tsx` → Paste → Save.

---

## CZĘŚĆ 7: Ciągłość - Następny Feature

### Krok 11: Przechodzisz do Siguiente Feature

Gdy skończyłeś Authentication, przechodzisz do Products (Sprint 2).

**Czytasz**:
- `.github/instructions/09-products-listing-and-caching.instructions.md`
- `.github/FEATURE-SEQUENCE.md` → Sprint 2 sekcja

**W chacie Copilota:**

```
Implement products listing using .github/instructions/09-products-listing-and-caching.instructions.md:

Create:
1. src/features/products/api/productClient.ts - API client with getAll() method
2. src/features/products/hooks/useAllProducts.ts - React Query hook with caching
3. src/features/products/ui/ProductList.tsx - List component with loading/error/empty states
4. src/features/products/ui/ProductCard.tsx - Card component for single product

Use React Query with staleTime: 5min, gcTime: 30min
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
Create [PLIK_PATH] based on .github/instructions/[NUMER]-[INSTRUKCJA].instructions.md:

Requirements:
- [Wymaganie 1]
- [Wymaganie 2]
- [Wymaganie 3]

Must include:
- TypeScript strict types (no 'any')
- Error handling
- Loading state
- Proper styled with [CSS Framework]
```

### Template 2: Hook Custom

```
Create [HOOK_PATH] as a React Query hook based on [INSTRUKCJA_FILE]:

API:
- Endpoint: [GET/POST /api/...]
- Request: [dziedzina pól]
- Response: [struktura]

Hook should:
- Use useQuery with staleTime: [X], gcTime: [Y]
- Handle loading/error/data states
- Include proper error handling
```

### Template 3: Test Integracyjny

```
Create integration test for [FEATURE_NAME] using MSW:

From .github/instructions/16-integration-testing-scenarios.instructions.md:

Test should cover:
1. [Happy path scenario]
2. [Error scenario]
3. [Edge case]

Use vitest + React Testing Library + MSW.
```

---

## CZĘŚĆ 9: Poradnik Gdy Jest Problem

### Copilot nie widzi instrukcji?

**Problem**: Copilot generuje kod który nie zgadza się z instrukcjami.

**Rozwiązanie**:
1. W prompt wyraźnie cytuj ścieżkę: `.github/instructions/08-...md`
2. Dodaj **cytat** z instrukcji do prompta:

```
Looking at .github/instructions/08-authentication-and-jwt.instructions.md:

"JWT is validated by backend on every request."

Please ensure that every API call includes the Authorization header...
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
I'm getting this TypeScript error:

[wklej błąd z terminala]

Can you fix [PLIK_NAZWĘ] to resolve this?
```

### Test nie przechodzi?

**W Terminal**:

```bash
npm run test
```

Jeśli test padł, skopiuj błąd do Copilota:

```
My test is failing:

[output z terminala]

How to fix the test in [TEST_PLIK]?
```

---

## CZĘŚĆ 10: Daily Workflow

Typical dzień pracy:

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
11:30 - Zakończ work, commit zmiany (git commit)
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
I'm new to React. How does the useAuth hook from 
.github/instructions/08-authentication-and-jwt.instructions.md work?
Can you explain the AuthContext pattern step by step?
```

Copilot wyjaśni ci dokładnie!

---

## Next: Obejrzyj Tutorial

Jeśli chcesz video tutorial o Copilot:
- YouTube: "GitHub Copilot tutorial React" 
- Official: https://docs.github.com/en/copilot

Ale **te instrukcje wystarczą** dla twojego projektu!

**Good luck! 🚀**
