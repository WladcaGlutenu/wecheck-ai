import React, { useEffect, useMemo, useState } from "react";

const COLORS = {
  brand: "#121331",
  accent: "#0485A2",
  bg: "#F6F8FB",
};

const APPROVERS = [
  { id: "mateusz", name: "Mateusz Banasiak", badge: "1" },
  { id: "jan", name: "Jan Matysiak", badge: "2" },
  { id: "piotr", name: "Piotr Majdan", badge: "3" },
];

const STANDARD_SUMMARY = [
  "Finalna wersja oferty dla klienta po zatwierdzeniu powinna zostać zapisana i wysłana jako PDF.",
  "Obowiązującym fontem w We'Support jest Lato. Dokument powinien być spójny wizualnie i czytelny.",
  "Każda oferta powinna zawierać: tytuł OFERTA, przedmiot, klienta, datę, autora, warianty, ceny, warunki płatności, koszty dostawy lub informację, że nie dotyczą, wybór wariantu oraz blok akceptacji.",
  "Sprzęt wizualny wymaga zdjęć dobrej jakości. Sprzęt niewizualny oraz usługi, licencje i oprogramowanie nie wymagają zdjęć.",
  "Mniej niż 5 licencji przy płatności miesięcznej to sugestia do potwierdzenia, a nie automatyczna blokada przekazania oferty do zatwierdzenia.",
  "Raport We’Check AI powinien wskazywać konkretnie: gdzie jest problem, czego dotyczy, dlaczego to ważne i jak go poprawić.",
];

const PROMPT_FILE_NAME = "We'Check AI_1.4.txt";
const PROMPT_DOWNLOAD_TEXT = [
  "We’Check AI - prompt v1.4",
  "",
  "Skrócony zapis do demonstracji interfejsu:",
  "",
  ...STANDARD_SUMMARY,
].join("\n");

function priorityTone(priority = "") {
  const value = priority.toLowerCase();
  if (value.includes("wysoki")) return "danger";
  if (value.includes("średni") || value.includes("sugestia")) return "warning";
  if (value.includes("brak")) return "info";
  return "low";
}

function statusTone(status = "") {
  const value = status.toLowerCase();
  if (value === "ok") return "ok";
  if (value.includes("brak")) return "danger";
  if (value.includes("uwaga") || value.includes("sugestia")) return "warning";
  if (value.includes("nie dotyczy")) return "info";
  return "info";
}

const DEMO_OFFERS = [
  {
    id: "visual",
    title: "Laptop MacBook Air",
    filename: "RPA_szablon_oferta_laptop_11062026.pdf",
    client: "Teatr Rampa",
    author: "Dominik Kwiatkowski",
    category: "Sprzęt wizualny",
    initial: {
      score: 81,
      status: "warning",
      allowProceed: false,
      statusTitle: "ŻÓŁTE ŚWIATŁO - WYMAGA DROBNEJ POPRAWKI",
      statusText: "Oferta wygląda estetycznie i zawiera zdjęcia zgodnie z zasadami dla sprzętu wizualnego, ale dokument deklaruje trzy warianty, a faktycznie pokazuje dwa.",
      tags: ["niespójna liczba wariantów", "sprzęt wizualny", "zdjęcia OK"],
      quickSummary: [
        "Ujednolicić liczbę wariantów - opis mówi o 3, a dokument pokazuje 2.",
  "Zaktualizować tabelę wyboru wariantu, aby odpowiadała treści oferty.",
  "Zmienić nazwę pliku, ponieważ słowo „szablon” może sugerować wersję roboczą dokumentu.",
  "Po poprawce ponownie uruchomić analizę przed przekazaniem do zatwierdzenia.",
      ],
      classification: {
        type: "Sprzęt wizualny",
        confidence: "Wysoki",
        reason: "Oferta dotyczy urządzenia, którego wygląd i prezentacja mają znaczenie dla klienta, więc zdjęcia produktu są wymagane i obecne.",
      },
      verdict: "Dokument spełnia większość wymagań formalnych i wizualnych, ale niespójność w liczbie wariantów jest zbyt wyraźna, by przekazać ofertę dalej bez korekty.",
      keyIssues: [
        { problem: "Opis wskazuje 3 warianty, a widoczne są 2", why: "Powstaje niespójność między treścią a częścią decyzyjną oferty.", action: "Dodać brakujący wariant albo zmienić opis i tabelę wyboru na 2 warianty.", priority: "ŚREDNI" },
      {
  problem: "Nazwa pliku sugeruje wersję roboczą",
  why: "Słowo „szablon” w nazwie pliku może wyglądać jak pozostałość robocza i obniżać profesjonalny odbiór finalnej oferty.",
  action: "Zmienić nazwę finalnego pliku, np. na RPA_Oferta_MacBookAir_20260611.pdf.",
  priority: "NISKI / ŚREDNI",
},
      ],
      standardReview: [
        { element: "Nazwa pliku", status: "Uwaga", comment: "Nazwa pliku zawiera słowo „szablon”, co w finalnej ofercie może sugerować wersję roboczą dokumentu. Przed przekazaniem do zatwierdzenia warto zmienić nazwę np. na RPA_Oferta_MacBookAir_20260611.pdf.",},
        { element: "Papier firmowy We’Support", status: "OK", comment: "Dokument jest przygotowany na papierze firmowym." },
        { element: "Font Lato", status: "OK", comment: "Dokument wygląda spójnie wizualnie." },
        { element: "Zdjęcia produktu", status: "OK", comment: "Zdjęcia są obecne i czytelne." },
        { element: "Warianty", status: "Uwaga", comment: "Treść i tabela wariantów są niespójne." },
        { element: "Blok akceptacji", status: "OK", comment: "Jest pole akceptacji z datą i podpisem." },
      ],
      typeReview: [
        { element: "Zdjęcia", status: "OK", comment: "Wymóg dla sprzętu wizualnego spełniony." },
        { element: "Czytelność tabeli wariantów", status: "Uwaga", comment: "Widoczne dwa warianty, mimo że opis zapowiada trzy." },
      ],
      errors: [
        { id: 1, location: "Sekcja Proponowane warianty", category: "warianty", description: "Opis mówi o 3 wariantach, ale w dokumencie są 2.", fix: "Ujednolicić liczbę wariantów w opisie i tabeli wyboru.", priority: "ŚREDNI" },
      {
  id: 2,
  location: "Nazwa pliku",
  category: "nazwa pliku",
  description: "Nazwa pliku zawiera słowo „szablon”, co może sugerować wersję roboczą dokumentu.",
  fix: "Zmienić nazwę finalnego pliku, np. na RPA_Oferta_MacBookAir_20260611.pdf.",
  priority: "NISKI / ŚREDNI",
},
      ],
      languageReview: {
        rows: [{ fragment: "Sekcja wariantów", problem: "Niespójność opisu", fix: "Ujednolicić liczbę wariantów.", reference: "błąd nr 1" }],
        note: "Nie wykryto istotnych błędów ortograficznych ani językowych.",
      },
      layoutReview: [
        { location: "Cały dokument", element: "Układ strony", problem: "Układ jest czytelny i schludny.", fix: "Bez zmian.", reference: "-" },
      ],
      dataReview: [
        { element: "Warianty", status: "Uwaga", comment: "Niespójność liczby wariantów.", reference: "błąd nr 1" },
      ],
      risks: [
        { risk: "Niespójność wariantów", level: "średni", why: "Może wprowadzać klienta w błąd.", action: "Poprawić opis i tabelę.", reference: "błąd nr 1" },
      ],
      questions: ["Czy dokument ma finalnie zawierać 2 czy 3 warianty?"],
      checklist: [
        { priority: "średni", task: "Ujednolicić liczbę wariantów.", owner: "Osoba przygotowująca ofertę", status: "Do zrobienia" },
      ],
      approverNote: "Oferta wygląda dobrze wizualnie, ale przed przekazaniem do zatwierdzenia trzeba poprawić niespójność w liczbie wariantów. Po tej zmianie dokument powinien być gotowy do oceny przez osobę decyzyjną.",
      finalReminder: "Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie. Po zatwierdzeniu przez osobę odpowiedzialną, finalną wersję dla klienta należy zapisać i wysłać jako PDF.",
    },
    corrected: {
      score: 94,
      status: "ok",
      allowProceed: true,
      statusTitle: "ZIELONE ŚWIATŁO - GOTOWE DO ZATWIERDZENIA",
      statusText: "Liczba wariantów została ujednolicona. Oferta spełnia wymagania dla sprzętu wizualnego i może zostać przekazana do finalnego zatwierdzenia.",
      tags: ["warianty ujednolicone", "sprzęt wizualny", "gotowe do akceptacji"],
      quickSummary: ["Nie wykryto istotnych błędów. Oferta wygląda na gotową do przekazania do finalnego zatwierdzenia."],
      classification: { type: "Sprzęt wizualny", confidence: "Wysoki", reason: "Zdjęcia są obecne, a treść dokumentu jest już spójna z tabelą wyboru wariantu." },
      verdict: "Oferta jest kompletna, spójna i wygląda na gotową do przekazania do finalnego zatwierdzenia. We’Check AI nie zatwierdza oferty samodzielnie - finalną decyzję podejmuje osoba odpowiedzialna.",
      keyIssues: [],
      standardReview: [
        { element: "Nazwa pliku", status: "OK", comment: "Nazwa pliku jest poprawna." },
        { element: "Papier firmowy We’Support", status: "OK", comment: "Papier firmowy obecny." },
        { element: "Font Lato", status: "OK", comment: "Dokument wygląda spójnie." },
        { element: "Warianty", status: "OK", comment: "Treść i tabela wyboru są spójne." },
      ],
      typeReview: [{ element: "Zdjęcia", status: "OK", comment: "Zdjęcia produktu są czytelne i poprawne." }],
      errors: [],
      languageReview: { rows: [], note: "Nie wykryto istotnych błędów językowych." },
      layoutReview: [{ location: "Cały dokument", element: "Układ strony", problem: "Układ jest czytelny i spójny.", fix: "Bez zmian.", reference: "-" }],
      dataReview: [{ element: "Warianty", status: "OK", comment: "Liczba wariantów jest spójna.", reference: "-" }],
      risks: [{ risk: "Brak istotnych ryzyk", level: "niski", why: "Nie wykryto problemów blokujących.", action: "Przekazać do zatwierdzenia.", reference: "-" }],
      questions: [],
      checklist: [
  {
    priority: "niski",
    task: "Przekazać ofertę do osoby zatwierdzającej.",
    owner: "Osoba przygotowująca ofertę",
    status: "Gotowe",
  },
  {
    priority: "niski/średni",
    task: "Zmienić nazwę finalnego pliku tak, aby nie zawierała słowa „szablon”.",
    owner: "Autor oferty",
    status: "Do zrobienia",
  },
],
      approverNote: "Oferta jest gotowa do przekazania do finalnego zatwierdzenia.",
      finalReminder: "Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie. Po zatwierdzeniu przez osobę odpowiedzialną finalną wersję dla klienta należy zapisać i wysłać jako PDF.",
},
    corrected: null,
  },
  {
    id: "hardware",
    title: "Rozbudowa komputera o nowe podzespoły",
    filename: "IDEAPP_Oferta_220526.pdf",
    client: "IDEAPP",
    author: "Kamil Zając",
    category: "Sprzęt niewizualny",
    initial: {
      score: 92,
      status: "warning",
      allowProceed: true,
      statusTitle: "ŻÓŁTE ŚWIATŁO - SUGESTIA DO POTWIERDZENIA",
      statusText: "Oferta spełnia wymagania dla sprzętu niewizualnego i może zostać przekazana do zatwierdzenia. We’Check AI sygnalizuje jedynie pytanie operacyjne dotyczące źródła zakupu części.",
      tags: ["sugestia do potwierdzenia", "sprzęt niewizualny", "3 warianty"],
      quickSummary: [
        "Potwierdzić, że podzespoły będą zamawiane u właściwego dostawcy.",
        "Poza pytaniem kontrolnym dokument wygląda na gotowy do przekazania do zatwierdzenia.",
      ],
      classification: { type: "Sprzęt niewizualny", confidence: "Wysoki", reason: "Oferta dotyczy podzespołów komputerowych. Zdjęcia nie są wymagane dla tego typu dokumentu." },
      verdict: "Dokument spełnia standard We’Support i nie zawiera braków blokujących. Warto jedynie potwierdzić źródło zakupu części, bo przy tego typu ofertach ma to znaczenie operacyjne.",
      keyIssues: [
        { problem: "Źródło zakupu części do potwierdzenia", why: "Przy sprzęcie niewizualnym i podzespołach warto pilnować jakości i pochodzenia komponentów.", action: "Potwierdzić zakup u oficjalnego dystrybutora.", priority: "SUGESTIA" },
      ],
      standardReview: [
        { element: "Nazwa pliku", status: "OK", comment: "Nazwa pliku jest logiczna." },
        { element: "Papier firmowy We’Support", status: "OK", comment: "Papier firmowy jest obecny." },
        { element: "Font Lato", status: "OK", comment: "Dokument wygląda spójnie." },
        { element: "Zdjęcia", status: "Nie dotyczy", comment: "Dla sprzętu niewizualnego zdjęcia nie są wymagane." },
      ],
      typeReview: [
        { element: "Zdjęcia produktu", status: "Nie dotyczy", comment: "Ten typ oferty nie wymaga zdjęć." },
        { element: "Źródło zakupu", status: "Uwaga", comment: "Warto potwierdzić oficjalnego dystrybutora." },
      ],
      errors: [
        { id: 1, location: "Pytanie kontrolne", category: "logika biznesowa", description: "Warto potwierdzić źródło zakupu części.", fix: "Potwierdzić zakup u oficjalnego dystrybutora.", priority: "SUGESTIA" },
      ],
      languageReview: { rows: [], note: "Nie wykryto istotnych błędów językowych." },
      layoutReview: [{ location: "Cały dokument", element: "Układ strony", problem: "Układ jest czytelny i spójny.", fix: "Bez zmian.", reference: "-" }],
      dataReview: [{ element: "Parametry i ceny", status: "OK", comment: "Dane są spójne.", reference: "-" }],
      risks: [{ risk: "Źródło zakupu części", level: "niski", why: "Może mieć wpływ na jakość i gwarancję komponentów.", action: "Potwierdzić dostawcę.", reference: "błąd nr 1" }],
      questions: ["Czy części będą zamawiane u oficjalnego dystrybutora?"],
      checklist: [{ priority: "niski", task: "Potwierdzić źródło zakupu części.", owner: "Osoba przygotowująca ofertę", status: "Do sprawdzenia" }],
      approverNote: "Oferta wygląda dobrze i może zostać przekazana do zatwierdzenia. Jedyna uwaga ma charakter operacyjny i dotyczy źródła zakupu części.",
      finalReminder: "Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie. Po zatwierdzeniu przez osobę odpowiedzialną finalną wersję dla klienta należy zapisać i wysłać jako PDF.",
    },
    corrected: null,
  },
  {
    id: "license",
    title: "Microsoft 365 Business Basic",
    filename: "BUD_Oferta_M365_20260611.pdf",
    client: "Budokop Beton Lidzbark Warmiński",
    author: "Szymon Wiktor",
    category: "Usługi i licencje",
    initial: {
      score: 89,
      status: "warning",
      allowProceed: true,
      statusTitle: "ŻÓŁTE ŚWIATŁO - SUGESTIA DO POTWIERDZENIA",
      statusText: "Oferta może zostać przekazana do zatwierdzenia. Wariant miesięczny obejmuje 4 sztuki, więc We’Check AI zgłasza to jako sugestię do potwierdzenia, a nie błąd blokujący dalszy krok.",
      tags: ["sugestia do potwierdzenia", "4 sztuki / miesięcznie", "NBP OK"],
      quickSummary: [
        "Potwierdzić wyjątek dla 4 licencji przy rozliczeniu miesięcznym.",
        "Doprecyzować, że ceny dotyczą łącznie 4 licencji, a nie jednej sztuki.",
        "Dopisać przy kwotach PLN, że są wartościami netto, np. Szacunkowo netto.",
        "Dodać informację: Dostawa: nie dotyczy - licencje elektroniczne.",
      ],
      classification: { type: "Usługi, licencje i oprogramowanie", confidence: "Wysoki", reason: "Oferta dotyczy licencji Microsoft 365 Business Basic, 4 sztuk, z wariantem płatności miesięcznej i rocznej. Zdjęcia produktów nie są wymagane." },
      verdict: "Oferta ma poprawny szablon, zawiera dane klienta, datę, autora, warianty, ceny, dopisek o kursie NBP oraz blok akceptacji. Najważniejsze ryzyko dotyczy wariantu miesięcznego dla 4 licencji, ponieważ standard We’Check wymaga pytania kontrolnego przy mniej niż 5 sztukach w rozliczeniu miesięcznym.",
      keyIssues: [
        { problem: "4 licencje przy płatności miesięcznej", why: "Standardowo nie oferujemy mniej niż 5 sztuk przy rozliczeniu miesięcznym.", action: "Potwierdzić wyjątek z osobą zatwierdzającą albo zmienić ofertę.", priority: "ŚREDNI" },
        { problem: "Niejasne, czy cena dotyczy jednej licencji czy wszystkich 4", why: "Klient może błędnie zrozumieć cenę jako jednostkową.", action: "Dopisać: Wartość netto za 4 licencje.", priority: "ŚREDNI" },
        { problem: "Szacunkowe PLN bez dopisku netto", why: "Może powstać pytanie, czy szacunek PLN jest netto czy brutto.", action: "Zamienić na: Szacunkowo netto.", priority: "ŚREDNI" },
        { problem: "Brak informacji o dostawie", why: "Przy licencjach dostawa nie dotyczy, ale warto to jasno wskazać.", action: "Dopisać: Dostawa: nie dotyczy - licencje elektroniczne.", priority: "NISKI" },
      ],
      standardReview: [
        { element: "Nazwa pliku", status: "OK", comment: "BUD_Oferta_M365_20260611.pdf jest logiczna i zgodna z datą oferty." },
        { element: "Papier firmowy We’Support", status: "OK", comment: "Jest logo u góry, linie boczne i stopka firmowa." },
        { element: "Font Lato", status: "Uwaga", comment: "Wizualnie spójne, ale warto upewnić się, że dokument źródłowy używa wyłącznie Lato." },
        { element: "Finalny PDF dla klienta po zatwierdzeniu", status: "OK", comment: "Plik jest PDF-em." },
        { element: "Tytuł OFERTA", status: "OK", comment: "Tytuł widoczny i czytelny." },
        { element: "Klient", status: "OK", comment: "Budokop Beton Lidzbark Warmiński." },
        { element: "Data oferty", status: "OK", comment: "11.06.2026." },
        { element: "Autor", status: "OK", comment: "Szymon Wiktor." },
        { element: "Warianty", status: "OK", comment: "Są 2 warianty: płatność miesięczna i roczna." },
        { element: "Koszty dostawy / informacja, że nie dotyczy", status: "Brak", comment: "Przy licencjach wystarczy dopisać: Dostawa: nie dotyczy - licencje elektroniczne." },
      ],
      typeReview: [
        { element: "Liczba licencji / użytkowników", status: "Uwaga", comment: "4 sztuki. Przy płatności miesięcznej wymaga potwierdzenia wyjątku." },
        { element: "Okres zobowiązania", status: "OK", comment: "W obu wariantach wskazano zobowiązanie roczne." },
        { element: "Model płatności", status: "OK / Uwaga", comment: "Różnica między wariantami jest logiczna, ale przy wariancie 1 warto dopisać: zobowiązanie roczne, rozliczenie miesięczne." },
        { element: "Waluta", status: "OK", comment: "Ceny w EUR i szacunkowo w PLN." },
        { element: "Dopisek o kursie NBP", status: "OK", comment: "Dopisek jest obecny i zgodny ze standardem." },
      ],
      errors: [
        { id: 1, location: "Wariant 1 - płatność miesięczna", category: "logika biznesowa", description: "Oferta miesięczna obejmuje 4 licencje, czyli mniej niż standardowe minimum 5 sztuk.", fix: "Potwierdzić wyjątek z osobą zatwierdzającą albo zmienić liczbę/licencjonowanie.", priority: "ŚREDNI" },
        { id: 2, location: "Oba warianty - sekcja ceny", category: "cena", description: "Nie jest wprost napisane, że cena dotyczy łącznej wartości za 4 licencje.", fix: "Dopisać np. Wartość netto za 4 licencje.", priority: "ŚREDNI" },
        { id: 3, location: "Oba warianty - kwoty PLN", category: "cena / waluta", description: "Przy kwotach PLN widnieje SZACUNKOWO, ale bez dopisku netto.", fix: "Zmienić na SZACUNKOWO NETTO.", priority: "ŚREDNI" },
        { id: 4, location: "Część informacyjna oferty", category: "formalny", description: "Brak informacji o dostawie lub dopisku, że nie dotyczy.", fix: "Dopisać: Dostawa: nie dotyczy - licencje elektroniczne.", priority: "NISKI" },
      ],
      languageReview: {
        rows: [
          { fragment: "Zobowiązanie: Roczne", problem: "Kosmetyczna niespójność stylu - po dwukropku można użyć małej litery.", fix: "Zobowiązanie: roczne", reference: "sugestia" },
          { fragment: "20,75 € /miesięcznie", problem: "Niezgrabny zapis typograficzny z ukośnikiem.", fix: "20,75 € miesięcznie", reference: "sugestia" },
        ],
        note: "Nie wykryto istotnych błędów ortograficznych ani poważnych błędów językowych.",
      },
      layoutReview: [
        { location: "Cały dokument", element: "Układ strony", problem: "Układ jest czytelny, spójny i mieści się na jednej stronie.", fix: "Bez zmian.", reference: "-" },
        { location: "Oba warianty", element: "Tabele wariantów", problem: "Tabele są czytelne i konsekwentne.", fix: "Bez zmian.", reference: "-" },
      ],
      dataReview: [
        { element: "Klient", status: "OK", comment: "Budokop Beton Lidzbark Warmiński.", reference: "-" },
        { element: "Data", status: "OK", comment: "11.06.2026, zgodna z nazwą pliku.", reference: "-" },
        { element: "Autor", status: "OK", comment: "Szymon Wiktor.", reference: "-" },
        { element: "Produkt", status: "OK", comment: "Microsoft 365 Business Basic.", reference: "-" },
        { element: "Liczba sztuk", status: "Uwaga", comment: "4 sztuki przy wariancie miesięcznym wymagają potwierdzenia wyjątku.", reference: "błąd nr 1" },
        { element: "Dopisek NBP", status: "OK", comment: "Jest obecny.", reference: "-" },
      ],
      risks: [
        { risk: "Rozliczenie miesięczne dla 4 sztuk", level: "średni", why: "Może naruszać standard minimalnej liczby licencji przy płatności miesięcznej.", action: "Potwierdzić wyjątek albo zmienić ofertę.", reference: "błąd nr 1" },
        { risk: "Niejasność ceny za sztukę / za całość", level: "średni", why: "Klient może źle odczytać wartość oferty.", action: "Dopisać za 4 licencje.", reference: "błąd nr 2" },
        { risk: "PLN bez dopisku netto", level: "średni", why: "Może powstać pytanie, czy szacunek PLN jest netto czy brutto.", action: "Dopisać szacunkowo netto.", reference: "błąd nr 3" },
      ],
      questions: [
        "Czy sprzedaż 4 licencji przy rozliczeniu miesięcznym jest celowo zaakceptowanym wyjątkiem przez osobę zatwierdzającą ofertę?",
        "Czy ceny 20,75 EUR miesięcznie i 237,12 EUR rocznie są łączną wartością za 4 licencje?",
        "Czy wartości PLN mają być traktowane jako szacunkowe wartości netto?",
        "Czy w finalnej wersji dopisać: Dostawa: nie dotyczy - licencje elektroniczne?",
      ],
      checklist: [
        { priority: "średni", task: "Potwierdzić wyjątek dla 4 licencji przy płatności miesięcznej.", owner: "Osoba przygotowująca + osoba zatwierdzająca", status: "Do zrobienia" },
        { priority: "średni", task: "Dopisać, że ceny są łączną wartością za 4 licencje.", owner: "Osoba przygotowująca ofertę", status: "Do zrobienia" },
        { priority: "średni", task: "Dopisać szacunkowo netto przy wartościach PLN.", owner: "Osoba przygotowująca ofertę", status: "Do zrobienia" },
        { priority: "niski", task: "Dopisać informację, że dostawa nie dotyczy.", owner: "Osoba przygotowująca ofertę", status: "Do zrobienia" },
      ],
      approverNote: "Oferta jest schludna, czytelna i przygotowana na właściwym szablonie We’Support. Przed przekazaniem do finalnego zatwierdzenia trzeba jednak potwierdzić wyjątek dla 4 licencji przy płatności miesięcznej oraz doprecyzować, że podane ceny dotyczą łącznie 4 licencji.",
      finalReminder: "Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie. Po zatwierdzeniu przez osobę odpowiedzialną finalną wersję dla klienta należy zapisać i wysłać jako PDF.",
    },
    corrected: {
      score: 94,
      status: "ok",
      allowProceed: true,
      statusTitle: "ZIELONE ŚWIATŁO - GOTOWE DO ZATWIERDZENIA",
      statusText: "Wyjątek dla 4 sztuk przy rozliczeniu miesięcznym został zaakceptowany, a pozostałe uwagi zostały domknięte. Oferta może zostać przekazana do finalnego zatwierdzenia.",
      tags: ["wyjątek zatwierdzony", "NBP OK", "gotowe do akceptacji"],
      quickSummary: ["Nie wykryto istotnych błędów. Oferta wygląda na gotową do przekazania do finalnego zatwierdzenia."],
      classification: { type: "Usługi, licencje i oprogramowanie", confidence: "Wysoki", reason: "Oferta licencyjna po poprawkach spełnia standard We’Support i nie zawiera już otwartych punktów do doprecyzowania." },
      verdict: "Dokument wygląda na kompletny i gotowy do przekazania do osoby odpowiedzialnej za finalne zatwierdzenie. We’Check AI nie zatwierdza oferty samodzielnie - finalną decyzję zawsze podejmuje człowiek.",
      keyIssues: [],
      standardReview: [{ element: "Standard We’Support", status: "OK", comment: "Oferta po poprawkach spełnia standard." }],
      typeReview: [{ element: "Liczba licencji", status: "OK", comment: "Wyjątek dla 4 sztuk został potwierdzony." }],
      errors: [],
      languageReview: { rows: [], note: "Nie wykryto istotnych błędów językowych ani typograficznych." },
      layoutReview: [{ location: "Cały dokument", element: "Układ strony", problem: "Układ jest czytelny i spójny.", fix: "Bez zmian.", reference: "-" }],
      dataReview: [{ element: "Ceny i liczba sztuk", status: "OK", comment: "Ceny są doprecyzowane jako łączne wartości za 4 licencje.", reference: "-" }],
      risks: [{ risk: "Brak istotnych ryzyk", level: "niski", why: "Punkty wymagające potwierdzenia zostały domknięte.", action: "Przekazać do zatwierdzenia.", reference: "-" }],
      questions: [],
      checklist: [{ priority: "niski", task: "Przekazać ofertę do osoby zatwierdzającej.", owner: "Osoba przygotowująca ofertę", status: "Gotowe" }],
      approverNote: "Oferta po poprawkach wygląda na gotową do przekazania do finalnego zatwierdzenia.",
      finalReminder: "Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie. Po zatwierdzeniu przez osobę odpowiedzialną finalną wersję dla klienta należy zapisać i wysłać jako PDF.",
    },
  },
];

const ANALYSIS_LINES = [
  ["Klasyfikacja oferty", "Rozpoznanie typu dokumentu"],
  ["Standard We’Support", "Papier firmowy, pola, warianty"],
  ["Język i układ", "Interpunkcja, tabele, estetyka"],
  ["Logika biznesowa", "Reguły licencji, zdjęcia, wyjątki"],
  ["Gotowość do zatwierdzenia", "Status końcowy i dalszy krok"],
];

function Tag({ children, type = "info" }) {
  return <span className={`tag tag-${type}`}>{children}</span>;
}

function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

function StepItem({ number, title, subtitle, active, done }) {
  return (
    <div className={`step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <div className="step-number">{done ? "✓" : number}</div>
      <div className="step-text">
        <strong>{title}</strong>
      </div>
    </div>
  );
}

function SummaryCard({ index, text }) {
  return (
    <div className="summary-item">
      <div className="summary-no">{index}</div>
      <div>
        <strong>Punkt {index}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function ReportSection({ title, subtitle, children }) {
  return (
    <section className="card report-section">
      <div className="section-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function TableSection({ title, subtitle, columns, rows, renderCell }) {
  return (
    <ReportSection title={title} subtitle={subtitle}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-cell">Brak danych do wyświetlenia.</td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((col) => (
                    <td key={col.key}>{renderCell ? renderCell(row, col.key) : row[col.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ReportSection>
  );
}

function Modal({ title, children, actions, wide = false }) {
  return (
    <div className="modal-backdrop">
      <div className={`modal-box ${wide ? "modal-box-wide" : ""}`}>
        <h3>{title}</h3>
        <div className="modal-text">{children}</div>
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}
function StandardWeSupportContent() {
  const requiredElements = [
    ["Tytuł", "Widoczny tytuł OFERTA"],
    ["Przedmiot oferty", "Jasna informacja, czego dotyczy dokument"],
    ["Klient", "Nazwa klienta zgodna z nazwą pliku"],
    ["Data oferty", "Data przygotowania dokumentu"],
    ["Autor", "Osoba przygotowująca ofertę"],
    ["Warianty", "Standardowo 2-3 warianty"],
    ["Ceny", "Jasno opisane ceny"],
    ["Netto/brutto", "Informacja, czy ceny są netto czy brutto"],
    ["Warunki płatności", "Jasny sposób rozliczenia"],
    ["Koszty dostawy", "Kwota albo informacja, że nie dotyczy lub jest wliczona"],
    ["Wybór wariantu", "Miejsce na wskazanie wybranego wariantu"],
    ["Wybór płatności", "Jeżeli jest więcej niż jedna forma płatności"],
    ["Instrukcja", "Np. niepotrzebne skreślić"],
    ["Uwagi", "Jeżeli są potrzebne"],
    ["Blok akceptacji", "Miejsce na decyzję klienta"],
    ["Data akceptacji", "Pole do uzupełnienia"],
    ["Pieczątka i podpis", "Miejsce na podpis osoby akceptującej"],
  ];

  return (
    <div className="standard-content">
      <div className="standard-intro">
        <span className="standard-kicker">Standard We’Support</span>
        <p>
          Standard określa, jak powinna wyglądać poprawnie przygotowana oferta przed przekazaniem jej do finalnego zatwierdzenia przez osobę odpowiedzialną.
        </p>
        <p>
          We’Check AI nie zatwierdza ofert i nie podejmuje decyzji o wysyłce do klienta. Jego zadaniem jest sprawdzenie, czy dokument spełnia standard jakości We’Support i czy może zostać przekazany dalej do człowieka.
        </p>
      </div>

      <section className="standard-section">
        <h4>1. Typ oferty</h4>
        <div className="standard-card-grid">
          <div className="standard-mini-card">
            <strong>Sprzęt wizualny</strong>
            <p>Sprzęt, którego wygląd może mieć znaczenie dla klienta, np. laptop, monitor, tablet, telefon, komputer All-in-One, sprzęt konferencyjny.</p>
            <div className="standard-badge">Wymagane zdjęcia produktu</div>
          </div>
          <div className="standard-mini-card">
            <strong>Sprzęt niewizualny</strong>
            <p>Podzespoły i elementy infrastruktury, których wygląd zwykle nie ma znaczenia, np. dyski, RAM, części serwerowe, rozbudowa komputerów.</p>
            <div className="standard-badge standard-badge-muted">Zdjęcia nie są wymagane</div>
          </div>
          <div className="standard-mini-card">
            <strong>Usługi, licencje i oprogramowanie</strong>
            <p>Usługi, subskrypcje, licencje, abonamenty, Microsoft 365, SaaS, wsparcie producenta i przedłużenia licencji.</p>
            <div className="standard-badge standard-badge-muted">Kluczowe są warunki i liczby</div>
          </div>
        </div>
      </section>

      <section className="standard-section">
        <h4>2. Papier firmowy i format końcowy</h4>
        <p>Finalna wersja oferty dla klienta powinna być przygotowana na papierze firmowym lub zgodnym szablonie We’Support.</p>
        <ul>
          <li>centralne logo „we’support” u góry,</li>
          <li>cienkie poziome linie po lewej i prawej stronie logo,</li>
          <li>minimalistyczny biały układ,</li>
          <li>stopka: <strong>WE’SUPPORT | PEŁNA OBSŁUGA INFORMATYCZNA DLA TWOICH KLIENTÓW</strong>.</li>
        </ul>
        <div className="standard-note">
          Oferta robocza do zatwierdzenia wewnętrznego nie musi być finalnym PDF-em, ale po zatwierdzeniu dokument powinien zostać zapisany i wysłany klientowi jako PDF.
        </div>
      </section>

      <section className="standard-section">
        <h4>3. Font firmowy</h4>
        <p>Obowiązującym fontem We’Support jest <strong>Lato</strong>.</p>
        <p>Dokument powinien wyglądać spójnie typograficznie. Należy unikać mieszania różnych fontów, przypadkowych rozmiarów tekstu, niespójnych nagłówków i różnych stylów tabel.</p>
        <div className="standard-question">
          Czy użycie innego fontu jest celowe, czy zapomniano zmienić font na obowiązujący w firmie - Lato?
        </div>
      </section>

      <section className="standard-section">
        <h4>4. Nazwa pliku</h4>
        <p>Nazwa pliku powinna być czytelna, logiczna i zgodna z przyjętym stylem We’Support.</p>
        <div className="standard-code">KLIENT_Oferta_Przedmiot_RRRRMMDD.pdf</div>
        <div className="standard-code">BUD_Oferta_M365_20260611.pdf</div>
        <p>Należy unikać nazw typu: final, final2, poprawione, nowe, test, kopia, bez uwag, do wysłania.</p>
      </section>

      <section className="standard-section">
        <h4>5. Obowiązkowe elementy każdej oferty</h4>
        <div className="standard-check-grid">
          {requiredElements.map(([title, desc]) => (
            <div className="standard-check-item" key={title}>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="standard-section">
        <h4>6. Warianty oferty</h4>
        <p>Dobra oferta powinna zwykle zawierać <strong>2-3 warianty</strong>.</p>
        <ul>
          <li>W ofertach sprzętowych warianty mogą być nazwane: ekonomiczny, rekomendowany, premium.</li>
          <li>W ofertach na licencje, usługi i oprogramowanie warianty mogą dotyczyć tego samego produktu, ale różnych modeli płatności.</li>
          <li>Oferta powinna jasno pokazywać różnice między wariantami.</li>
        </ul>
        <div className="standard-question">
          Czy przygotowanie tylko jednego wariantu jest celowe, czy należy dodać alternatywny wariant oferty?
        </div>
      </section>

      <section className="standard-section">
        <h4>7. Standard dla sprzętu wizualnego</h4>
        <p>Dla sprzętu wizualnego zdjęcia są wymagane.</p>
        <ul>
          <li>czy oferta zawiera zdjęcia produktu,</li>
          <li>czy zdjęcia są dobrej jakości,</li>
          <li>czy nie są rozmazane, rozciągnięte albo rozpikselizowane,</li>
          <li>czy są estetycznie osadzone w dokumencie,</li>
          <li>czy odpowiadają oferowanemu produktowi,</li>
          <li>czy pomagają klientowi w podjęciu decyzji.</li>
        </ul>
      </section>

      <section className="standard-section">
        <h4>8. Standard dla sprzętu niewizualnego</h4>
        <p>Dla sprzętu niewizualnego zdjęcia nie są wymagane. Brak zdjęć nie jest błędem.</p>
        <ul>
          <li>czy podano kluczowe parametry,</li>
          <li>czy wskazano liczbę sztuk,</li>
          <li>czy warianty są porównywalne,</li>
          <li>czy podano ceny netto lub brutto,</li>
          <li>czy wskazano koszty dostawy albo informację, że nie dotyczą,</li>
          <li>czy montaż, instalacja lub konfiguracja są w cenie, czy będą rozliczane osobno.</li>
        </ul>
        <div className="standard-warning">
          Czy części serwerowe będą zamawiane u oficjalnych dystrybutorów? Części serwerowych nie zamawiamy z Allegro, bo często są z nimi problemy.
        </div>
      </section>

      <section className="standard-section">
        <h4>9. Standard dla usług, licencji i oprogramowania</h4>
        <p>Oferta powinna jasno określać nazwę produktu, liczbę licencji, okres zobowiązania, model płatności i to, czy cena dotyczy jednej sztuki, czy wszystkich sztuk.</p>
        <div className="standard-code">Wartość netto za 4 licencje.</div>
        <div className="standard-note">
          Faktura zostanie dostarczona w PLN po przeliczeniu wedle kursu NBP na dzień przed wystawieniem faktury.
        </div>
        <div className="standard-warning">
          Przy licencjach lub usługach rozliczanych miesięcznie standardowo nie oferujemy mniej niż 5 sztuk. Przy płatności rocznej limit minimum 5 sztuk nie ma zastosowania.
        </div>
      </section>

      <section className="standard-section">
        <h4>10. Kontrola jakości dokumentu</h4>
        <div className="standard-card-grid">
          <div className="standard-mini-card">
            <strong>Język i redakcja</strong>
            <p>Literówki, interpunkcja, brakujące kropki, podwójne spacje, polskie znaki, styl, mieszanie PL/EN, nieczytelne skróty.</p>
          </div>
          <div className="standard-mini-card">
            <strong>Typografia</strong>
            <p>Spójność fontu, nagłówków, zapisu cen i dat, konsekwentne punktory, brak przypadkowych pogrubień i uszkodzonych znaków.</p>
          </div>
          <div className="standard-mini-card">
            <strong>Układ strony i tabele</strong>
            <p>Puste strony, przeniesione fragmenty, przecięte tabele, marginesy, wyrównania, kolumny, kolory tła i zgodność tabel z wariantami.</p>
          </div>
        </div>
      </section>

      <section className="standard-section">
        <h4>11. Czerwone flagi</h4>
        <div className="standard-danger-grid">
          {[
            "brak ceny",
            "brak klienta",
            "brak daty",
            "brak autora",
            "brak przedmiotu oferty",
            "brak wariantów bez uzasadnienia",
            "brak zdjęć przy sprzęcie wizualnym",
            "brak informacji netto/brutto",
            "brak kluczowych parametrów technicznych",
            "brak dopisku o kursie NBP, jeśli jest wymagany",
            "brak możliwości wyboru wariantu",
            "brak bloku akceptacji",
            "dane innego klienta",
            "pozostałości po poprzedniej ofercie",
            "niespójne ceny",
            "rozjechane tabele",
            "puste strony",
            "liczne błędy językowe",
            "nazwa pliku wskazująca innego klienta lub inną datę niż treść oferty",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="standard-section">
        <h4>12. Statusy We’Check AI</h4>
        <div className="standard-status-grid">
          <div className="standard-status standard-status-green">
            <strong>Zielone światło</strong>
            <p>Oferta wygląda poprawnie i może zostać przekazana do finalnego zatwierdzenia przez osobę odpowiedzialną.</p>
          </div>
          <div className="standard-status standard-status-yellow">
            <strong>Żółte światło</strong>
            <p>Oferta jest zasadniczo poprawna, ale wymaga drobnych poprawek, potwierdzeń lub decyzji.</p>
          </div>
          <div className="standard-status standard-status-red">
            <strong>Czerwone światło</strong>
            <p>Oferta zawiera błędy, braki lub ryzyka, które powinny zostać poprawione przed przekazaniem do zatwierdzenia.</p>
          </div>
        </div>
        <div className="standard-note">
          Zielone światło nie oznacza zgody na wysłanie oferty do klienta. Oznacza tylko, że We’Check AI nie wykrył istotnych błędów blokujących przekazanie dokumentu dalej.
        </div>
      </section>

      <section className="standard-section">
        <h4>13. Przypomnienie końcowe</h4>
        <p>Przed przekazaniem oferty do finalnego zatwierdzenia upewnij się, że dokument jest przygotowany na papierze firmowym We’Support, używa fontu Lato i nie zawiera błędów wskazanych w raporcie.</p>
        <p>Po zatwierdzeniu przez osobę odpowiedzialną finalną wersję dla klienta należy zapisać i wysłać jako PDF.</p>
      </section>
    </div>
  );
}
const APP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap');
* { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; }
body { background: #F6F8FB; }
button, input, select, textarea { font-family: inherit; }
.wecheck-root { min-height: 100vh; background: radial-gradient(circle at 12% -8%, rgba(4,133,162,0.10), transparent 34%), linear-gradient(180deg, #fff 0%, #F6F8FB 100%); color: #121331; font-family: Lato, Arial, sans-serif; }
.wecheck-app { width: min(1560px, calc(100% - 40px)); margin: 0 auto; padding: 24px 0 32px; }
.wecheck-topbar { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 18px; }
.wecheck-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.wecheck-brand-mark { width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; background: #121331; color: #fff; font-size: 20px; font-weight: 900; position: relative; overflow: hidden; flex-shrink: 0; box-shadow: 0 12px 26px rgba(18,19,49,0.16); }
.wecheck-brand-mark::after { content: ""; position: absolute; width: 24px; height: 70px; right: -8px; top: -12px; background: #0485A2; transform: rotate(28deg); opacity: 0.9; animation: brandShine 3.2s ease-in-out infinite; }
@keyframes brandShine { 0% { right: -18px; opacity: 0.55; } 50% { right: -4px; opacity: 1; } 100% { right: -18px; opacity: 0.55; } }
.wecheck-brand-copy {
  text-align: left !important;
}

.wecheck-brand-copy small {
  display: block;
  width: fit-content;
  margin: 0 0 5px 0;
  color: ${COLORS.accent};
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 900;
  font-size: 0.72rem;
  text-align: left !important;
}

.wecheck-brand-copy h1 {
  text-align: left !important;
}
.wecheck-brand-copy h1 { margin: 0; color: #121331; font-size: clamp(1.35rem, 2vw, 2rem); line-height: 1.12; font-weight: 900; letter-spacing: -0.02em; }
.wecheck-top-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; }
.btn { appearance: none; border: 0; min-height: 44px; border-radius: 14px; padding: 0 16px; font-size: 0.9rem; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; gap: 9px; transition: 0.16s ease; white-space: nowrap; cursor: pointer; text-decoration: none; }
.btn:hover { transform: translateY(-1px); }
.btn-primary { background: #0485A2; color: #fff; box-shadow: 0 12px 26px rgba(4,133,162,0.22); }
.btn-dark { background: #121331; color: #fff; box-shadow: 0 10px 22px rgba(18,19,49,0.18); }
.btn-ghost { background: #fff; color: #121331; border: 1px solid #C7D2DE; }
.btn-red { background: #CC3344; color: #fff; }
.btn-green { background: #0B7F64; color: #fff; }
.wecheck-workflow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
.step { background: #fff; border: 1px solid #DDE5EE; border-radius: 16px; padding: 13px 14px; display: flex; align-items: center; gap: 11px; box-shadow: 0 10px 30px rgba(18,19,49,0.06); min-width: 0; }
.step-number { width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; background: #eef2f7; color: #697586; font-size: 0.78rem; font-weight: 900; flex-shrink: 0; }
.step.active { border-color: rgba(4,133,162,0.28); background: #eef9fc; }
.step.done .step-number, .step.active .step-number { background: #0485A2; color: #fff; }
.step strong { display: block; color: #121331; font-size: 0.84rem; line-height: 1.15; }
.step span { display: block; color: #697586; font-size: 0.75rem; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wecheck-layout { display: grid; grid-template-columns: minmax(310px, 360px) minmax(0, 1fr); gap: 20px; align-items: start; }
.card { background: rgba(255,255,255,0.94); border: 1px solid #DDE5EE; border-radius: 24px; box-shadow: 0 10px 30px rgba(18,19,49,0.06); }
.card-pad { padding: 22px; }
.side { display: grid; gap: 16px; position: sticky; top: 18px; }
.section-kicker { display: block; margin-bottom: 9px; color: #0485A2; text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.72rem; font-weight: 900; text-align: left; }
.section-title { margin: 0; color: #121331; font-size: 1.25rem; line-height: 1.15; font-weight: 900; text-align: left; }
.section-desc { margin: 8px 0 0; color: #697586; font-size: 0.92rem; line-height: 1.55; text-align: left; }
.sample-list { display: grid; gap: 10px; margin-top: 16px; }
.sample-item { width: 100%; text-align: left; background: #F8FAFD; border: 1px solid #DDE5EE; border-radius: 16px; padding: 14px; cursor: pointer; }
.sample-item.active { border-color: rgba(4,133,162,0.36); background: #eef9fc; }
.sample-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.sample-title { color: #121331; font-weight: 900; font-size: 0.92rem; }
.sample-file { color: #8A95A7; font-size: 0.78rem; line-height: 1.35; word-break: break-word; }
.drop { margin-top: 17px; border: 1.5px dashed #b8c7d5; border-radius: 18px; background: linear-gradient(180deg, #fff 0%, #f7fbfd 100%); padding: 22px; text-align: center; }
.drop-icon { width: 60px; height: 60px; margin: 0 auto 13px; border-radius: 19px; display: grid; place-items: center; background: #eef9fc; color: #0485A2; font-size: 1.8rem; font-weight: 900; }
.drop h3 { margin: 0; color: #121331; font-size: 1rem; font-weight: 900; }
.drop p { margin: 7px 0 0; color: #697586; font-size: 0.82rem; line-height: 1.45; }
.upload-input { display: none; }
.upload-link { display: inline-flex; align-items: center; justify-content: center; margin-top: 14px; color: #0485A2; font-weight: 900; font-size: 0.85rem; text-decoration: underline; cursor: pointer; }
.file-selected { margin-top: 14px; padding: 12px; border: 1px solid #DDE5EE; border-radius: 14px; background: #F8FAFD; text-align: left; }
.file-selected strong { display: block; color: #121331; font-size: 0.88rem; word-break: break-word; }
.file-selected span { display: block; margin-top: 4px; color: #697586; font-size: 0.78rem; }
.side-actions { display: grid; gap: 10px; margin-top: 14px; }
.notice-demo { margin-top: 14px; padding: 12px 14px; border-radius: 14px; background: #FFF7E8; border: 1px solid #EFD19D; color: #BD7715; font-size: 0.82rem; line-height: 1.5; }
.main-content { display: grid; gap: 16px; min-width: 0; }
.status-card { padding: 24px; background: linear-gradient(90deg, rgba(255,247,232,0.9), rgba(255,255,255,0.98)); border-left: 5px solid #BD7715; overflow: visible; }
.status-card.ok { background: linear-gradient(90deg, rgba(236,253,245,0.95), rgba(255,255,255,0.98)); border-left-color: #0B7F64; }
.status-card.analyzing { border-left-color: #0485A2; background: linear-gradient(90deg, rgba(238,249,252,0.95), rgba(255,255,255,0.98)); }
.status-grid { display: grid; grid-template-columns: 76px minmax(0, 1fr) 220px; gap: 20px; align-items: center; }
.status-icon { width: 70px; height: 70px; border-radius: 22px; display: grid; place-items: center; font-size: 2rem; font-weight: 900; background: #FFF7E8; color: #BD7715; border: 1px solid #EFD19D; }
@keyframes aiGlow { 0% { box-shadow: 0 0 0 0 rgba(4,133,162,0.18); } 50% { box-shadow: 0 0 0 10px rgba(4,133,162,0); } 100% { box-shadow: 0 0 0 0 rgba(4,133,162,0); } }
.status-card.ok .status-icon { background: #ECFDF5; color: #0B7F64; border-color: #B8EAD5; }
.status-card.analyzing .status-icon { background: #eef9fc; color: #0485A2; border-color: rgba(4,133,162,0.22); animation: aiGlow 1.6s ease-in-out infinite; }
.status-title { margin: 0; color: #121331; font-size: clamp(1.45rem, 2.2vw, 2rem); font-weight: 900; letter-spacing: -0.02em; text-align: left; }
.status-desc { margin: 9px 0 0; color: #697586; font-size: 0.96rem; line-height: 1.55; max-width: 760px; text-align: left; }
.status-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 7px 11px; border: 1px solid transparent; font-size: 0.76rem; font-weight: 900; white-space: nowrap; }
.tag-warning { background: #FFF7E8; color: #BD7715; border-color: #EFD19D; }
.tag-info { background: rgba(4,133,162,0.08); color: #0485A2; border-color: rgba(4,133,162,0.20); }
.tag-low { background: #f2f8f5; color: #0B7F64; border-color: #d5ede4; }
.tag-danger { background: #FFF0F2; color: #CC3344; border-color: #FFD0D6; }
.tag-ok { background: #ECFDF5; color: #0B7F64; border-color: #B8EAD5; }
.score-box { border-left: 1px solid #DDE5EE; padding-left: 20px; }
.score-box small { display: block; color: #697586; font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.score-box strong { display: block; color: #0485A2; font-size: 2.5rem; line-height: 1; font-weight: 900; }
.score-box strong span { color: #121331; font-size: 1.2rem; }
.score-box p { margin: 8px 0 0; color: #697586; font-size: 0.82rem; line-height: 1.45; }
.analysis-box { background: linear-gradient(180deg, #fff 0%, #f7fbfd 100%); border: 1px solid #DDE5EE; border-radius: 18px; padding: 18px; margin-top: 16px; }
.analysis-rows { display: grid; gap: 12px; margin-top: 14px; }
.analysis-row { display: grid; grid-template-columns: 200px 1fr 54px; gap: 14px; align-items: center; }
.analysis-copy { display: grid; gap: 4px; }
.analysis-row strong { display: block; font-size: 0.86rem; color: #121331; line-height: 1.25; margin: 0; }
.analysis-row span { display: block; font-size: 0.76rem; color: #697586; line-height: 1.4; margin: 0; }
.bar { width: 100%; height: 10px; border-radius: 999px; background: #e8eef4; overflow: hidden; }
.bar > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #121331, #0485A2); }
.analysis-progress-value { min-width: 46px; text-align: right; font-size: 0.82rem; font-weight: 900; color: #0485A2; }
.report-section, .summary { overflow: hidden; }
.summary { padding: 0; }
.section-head, .summary-head { display: block; padding: 24px 24px 0 24px; margin: 0 0 16px 0; text-align: left !important; }
.section-head > div, .summary-head > div { width: 100%; text-align: left !important; }
.section-head h3, .summary-head h2 { margin: 0; color: #121331; font-size: 1.18rem; font-weight: 900; line-height: 1.2; text-align: left !important; }
.section-head p, .summary-head p { margin: 6px 0 0; color: #697586; font-size: 0.88rem; line-height: 1.5; text-align: left !important; }
.summary-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 0 24px 24px 24px; }
.summary-item { display: flex; gap: 11px; padding: 14px; background: #F8FAFD; border: 1px solid #DDE5EE; border-radius: 16px; min-height: 108px; text-align: left; }
.summary-no { width: 28px; height: 28px; border-radius: 999px; display: grid; place-items: center; background: #0485A2; color: #fff; font-size: 0.78rem; font-weight: 900; flex-shrink: 0; }
.summary-item strong { display: block; color: #121331; font-size: 0.88rem; margin-bottom: 5px; text-align: left; }
.summary-item p { margin: 0; color: #697586; font-size: 0.8rem; line-height: 1.45; text-align: left; }
.summary .approval-actions { padding: 0 24px 24px 24px; }
.meta-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.meta-box { border: 1px solid #DDE5EE; border-radius: 16px; padding: 14px; background: #F8FAFD; text-align: left; }
.meta-box small { display: block; color: #697586; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 900; margin-bottom: 6px; }
.meta-box strong { color: #121331; font-size: 0.95rem; }
.table-wrap { overflow-x: auto; padding: 0 24px 24px 24px; }
table { width: 100%; min-width: 880px; border-collapse: collapse; font-size: 0.82rem; }
th { text-align: left; padding: 13px 16px; color: #697586; background: #fbfcfe; border-bottom: 1px solid #DDE5EE; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.68rem; font-weight: 900; }
td { padding: 15px 16px; border-bottom: 1px solid #DDE5EE; vertical-align: top; color: #121331; text-align: left; }
tbody tr:hover td { background: #fbfdff; }
.empty-cell { text-align: center; color: #697586; }
.report-text { padding: 0 24px 24px 24px; color: #697586; font-size: 0.92rem; line-height: 1.7; text-align: left !important; }
.report-text p { margin: 0; text-align: left !important; }
.questions-list { display: grid; gap: 10px; padding: 0 24px 24px 24px; }
.question-item { display: flex; gap: 10px; padding: 12px 14px; border: 1px solid #DDE5EE; border-radius: 14px; background: #F8FAFD; text-align: left; }
.question-no { width: 22px; height: 22px; border-radius: 999px; background: #FFF7E8; border: 1px solid #EFD19D; color: #BD7715; display: grid; place-items: center; font-size: 0.72rem; font-weight: 900; flex-shrink: 0; }
.approval-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.approval-form { display: grid; gap: 14px; margin-top: 18px; }
.field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.field { display: grid; gap: 6px; }
.field label { font-size: 0.78rem; color: #697586; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
.input, .select, .textarea { width: 100%; border: 1px solid #C7D2DE; background: #fff; color: #121331; border-radius: 14px; padding: 12px 14px; font-size: 0.92rem; outline: none; }
.input:focus, .select:focus, .textarea:focus { border-color: #0485A2; box-shadow: 0 0 0 3px rgba(4,133,162,0.10); }
.textarea { min-height: 330px; resize: vertical; line-height: 1.55; }
.mail-preview { border: 1px solid #DDE5EE; border-radius: 18px; padding: 16px; background: #F8FAFD; }
.mail-preview-head { display: grid; gap: 10px; margin-bottom: 12px; }
.mail-help { color: #697586; font-size: 0.82rem; line-height: 1.5; }
.send-success { padding: 14px; border-radius: 16px; background: #ECFDF5; border: 1px solid #B8EAD5; color: #0B7F64; font-size: 0.9rem; font-weight: 700; line-height: 1.5; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(18,19,49,0.38); display: grid; place-items: center; padding: 20px; z-index: 30; }
.modal-box { width: min(560px, 100%); background: #fff; border: 1px solid #DDE5EE; border-radius: 22px; padding: 22px; box-shadow: 0 20px 40px rgba(18,19,49,0.18); }
.modal-box h3 { margin: 0; color: #121331; font-size: 1.3rem; font-weight: 900; }
.modal-text { margin-top: 10px; color: #697586; line-height: 1.6; font-size: 0.92rem; }
.modal-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.mobile-actions { display: none; position: sticky; bottom: 0; padding: 12px 0 0; margin-top: 16px; background: linear-gradient(180deg, transparent, #F6F8FB 28%); z-index: 4; }
.mobile-actions-inner { background: #fff; border: 1px solid #DDE5EE; border-radius: 18px; padding: 10px; box-shadow: 0 -10px 30px rgba(18,19,49,0.08); display: grid; gap: 8px; }
.footer { margin-top: 16px; color: #697586; text-align: center; font-size: 0.78rem; }
.footer a { color: #121331; font-weight: 900; text-decoration: none; }
.footer a:hover { text-decoration: underline; }
/* Standard We'Support - modal */
.modal-box-wide {
  width: min(1040px, 100%) !important;
  max-height: 86vh;
  overflow-y: auto;
}

.standard-content {
  display: grid;
  gap: 16px;
  color: ${COLORS.text};
  font-family: Lato, Arial, sans-serif;
  text-align: left;
}

.standard-intro {
  padding: 18px;
  border: 1px solid rgba(4,133,162,0.22);
  border-radius: 18px;
  background: linear-gradient(180deg, #f3fbfd 0%, #ffffff 100%);
}

.standard-kicker {
  display: block;
  margin-bottom: 10px;
  color: ${COLORS.accent};
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.72rem;
  font-weight: 900;
}

.standard-section {
  padding: 18px;
  border: 1px solid ${COLORS.line};
  border-radius: 18px;
  background: ${COLORS.surface};
}

.standard-section h4 {
  margin: 0 0 12px;
  color: ${COLORS.brand};
  font-size: 1.05rem;
  font-weight: 900;
  line-height: 1.25;
}

.standard-section p,
.standard-intro p {
  margin: 0 0 10px;
  color: ${COLORS.muted};
  font-size: 0.92rem;
  line-height: 1.62;
}

.standard-section p:last-child,
.standard-intro p:last-child {
  margin-bottom: 0;
}

.standard-section ul {
  margin: 0;
  padding-left: 20px;
  color: ${COLORS.muted};
  font-size: 0.9rem;
  line-height: 1.6;
}

.standard-section li {
  margin: 4px 0;
}

.standard-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.standard-mini-card {
  padding: 14px;
  border: 1px solid ${COLORS.line};
  border-radius: 16px;
  background: ${COLORS.surfaceSoft};
}

.standard-mini-card strong {
  display: block;
  margin-bottom: 8px;
  color: ${COLORS.brand};
  font-size: 0.94rem;
  font-weight: 900;
}

.standard-mini-card p {
  margin: 0;
  font-size: 0.84rem;
}

.standard-badge {
  display: inline-flex;
  margin-top: 12px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(4,133,162,0.08);
  border: 1px solid rgba(4,133,162,0.2);
  color: ${COLORS.accent};
  font-size: 0.74rem;
  font-weight: 900;
}

.standard-badge-muted {
  background: #f4f6f8;
  border-color: ${COLORS.line};
  color: ${COLORS.muted};
}

.standard-note,
.standard-question,
.standard-warning {
  margin-top: 12px;
  padding: 13px 14px;
  border-radius: 15px;
  font-size: 0.88rem;
  line-height: 1.55;
  font-weight: 700;
}

.standard-note {
  background: rgba(4,133,162,0.07);
  border: 1px solid rgba(4,133,162,0.18);
  color: ${COLORS.accent};
}

.standard-question {
  background: ${COLORS.warningBg};
  border: 1px solid ${COLORS.warningLine};
  color: ${COLORS.warning};
}

.standard-warning {
  background: ${COLORS.warningBg};
  border: 1px solid ${COLORS.warningLine};
  color: ${COLORS.warning};
}

.standard-code {
  margin: 10px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: ${COLORS.brand};
  color: #fff;
  font-size: 0.88rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.standard-check-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.standard-check-item {
  padding: 12px;
  border: 1px solid ${COLORS.line};
  border-radius: 14px;
  background: ${COLORS.surfaceSoft};
}

.standard-check-item strong {
  display: block;
  color: ${COLORS.brand};
  font-size: 0.86rem;
  font-weight: 900;
  margin-bottom: 4px;
}

.standard-check-item span {
  display: block;
  color: ${COLORS.muted};
  font-size: 0.8rem;
  line-height: 1.45;
}

.standard-danger-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.standard-danger-grid span {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  background: ${COLORS.dangerBg};
  border: 1px solid ${COLORS.dangerLine};
  color: ${COLORS.danger};
  font-size: 0.76rem;
  font-weight: 900;
}

.standard-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.standard-status {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid ${COLORS.line};
}

.standard-status strong {
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
  font-weight: 900;
}

.standard-status p {
  margin: 0;
  font-size: 0.84rem;
}

.standard-status-green {
  background: ${COLORS.successBg};
  border-color: ${COLORS.successLine};
  color: ${COLORS.success};
}

.standard-status-green p,
.standard-status-green strong {
  color: ${COLORS.success};
}

.standard-status-yellow {
  background: ${COLORS.warningBg};
  border-color: ${COLORS.warningLine};
  color: ${COLORS.warning};
}

.standard-status-yellow p,
.standard-status-yellow strong {
  color: ${COLORS.warning};
}

.standard-status-red {
  background: ${COLORS.dangerBg};
  border-color: ${COLORS.dangerLine};
  color: ${COLORS.danger};
}

.standard-status-red p,
.standard-status-red strong {
  color: ${COLORS.danger};
}

@media (max-width: 900px) {
  .standard-card-grid,
  .standard-status-grid,
  .standard-check-grid {
    grid-template-columns: 1fr;
  }
}
/* FIX: Standard We'Support - czytelny modal z przewijaniem */
.modal-box.modal-box-wide {
  width: min(1100px, calc(100vw - 32px)) !important;
  max-width: 1100px !important;
  height: min(86vh, 900px) !important;
  max-height: calc(100vh - 32px) !important;
  padding: 22px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}

.modal-box.modal-box-wide > h3 {
  flex: 0 0 auto;
  margin-bottom: 14px !important;
  text-align: center;
}

.modal-box.modal-box-wide .modal-text {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  padding-right: 8px !important;
}

.modal-box.modal-box-wide .modal-actions {
  flex: 0 0 auto;
  margin-top: 16px !important;
  padding-top: 14px;
  border-top: 1px solid ${COLORS.line};
  background: ${COLORS.white};
}

/* FIX: standard w jednej czytelnej kolumnie */
.standard-content {
  gap: 14px !important;
}

.standard-card-grid,
.standard-status-grid,
.standard-check-grid {
  grid-template-columns: 1fr !important;
}

.standard-mini-card {
  padding: 16px !important;
}

.standard-mini-card p,
.standard-section p,
.standard-intro p {
  font-size: 0.92rem !important;
  line-height: 1.6 !important;
}

.standard-badge {
  width: fit-content !important;
  max-width: 100% !important;
  white-space: normal !important;
}

.standard-section {
  padding: 18px !important;
}

.standard-danger-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
}

.standard-danger-grid span {
  display: block !important;
  white-space: normal !important;
}

@media (max-width: 700px) {
  .modal-box.modal-box-wide {
    width: calc(100vw - 20px) !important;
    height: calc(100vh - 20px) !important;
    max-height: calc(100vh - 20px) !important;
    padding: 16px !important;
  }

  .standard-danger-grid {
    grid-template-columns: 1fr !important;
  }
}
  /* FIX: uporządkowany nagłówek aplikacji */
.wecheck-topbar {
  align-items: center !important;
  margin-bottom: 22px !important;
}

.wecheck-brand {
  align-items: center !important;
  gap: 16px !important;
}

.wecheck-brand-mark {
  width: 56px !important;
  height: 56px !important;
  border-radius: 18px !important;
  font-size: 21px !important;
  flex-shrink: 0 !important;
}

.wecheck-brand-copy {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  gap: 6px !important;
  text-align: left !important;
}

.wecheck-brand-copy small {
  display: inline-flex !important;
  width: auto !important;
  margin: 0 !important;
  padding: 5px 10px !important;
  border-radius: 999px !important;
  background: rgba(4,133,162,0.08) !important;
  border: 1px solid rgba(4,133,162,0.18) !important;
  color: ${COLORS.accent} !important;
  text-transform: uppercase !important;
  letter-spacing: 0.13em !important;
  font-size: 0.68rem !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  text-align: left !important;
}

.wecheck-brand-copy h1 {
  margin: 0 !important;
  color: ${COLORS.brand} !important;
  font-size: clamp(1.85rem, 3vw, 2.45rem) !important;
  line-height: 1.05 !important;
  font-weight: 900 !important;
  letter-spacing: -0.04em !important;
  text-align: left !important;
}

.wecheck-top-actions {
  align-self: center !important;
}

@media (max-width: 700px) {
  .wecheck-brand {
    align-items: flex-start !important;
  }

  .wecheck-brand-mark {
    width: 48px !important;
    height: 48px !important;
  }

  .wecheck-brand-copy h1 {
    font-size: 1.55rem !important;
    line-height: 1.12 !important;
  }
}
/* FIX: nagłówek - wersja prosta i zwarta */
.wecheck-topbar {
  align-items: center !important;
  margin-bottom: 18px !important;
}

.wecheck-brand {
  align-items: center !important;
  gap: 14px !important;
}

.wecheck-brand-mark {
  width: 48px !important;
  height: 48px !important;
  border-radius: 16px !important;
  font-size: 20px !important;
  flex-shrink: 0 !important;
}

.wecheck-brand-copy {
  display: block !important;
  text-align: left !important;
}

.wecheck-brand-copy small {
  display: block !important;
  width: auto !important;
  margin: 0 0 2px 0 !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: ${COLORS.accent} !important;
  text-transform: uppercase !important;
  letter-spacing: 0.16em !important;
  font-size: 0.72rem !important;
  font-weight: 900 !important;
  line-height: 1.1 !important;
  text-align: left !important;
}

.wecheck-brand-copy h1 {
  margin: 0 !important;
  color: ${COLORS.brand} !important;
  font-size: clamp(1.75rem, 2.4vw, 2.15rem) !important;
  line-height: 1.05 !important;
  font-weight: 900 !important;
  letter-spacing: -0.03em !important;
  text-align: left !important;
}
/* FIX: czytelne formatowanie Standard We'Support */
.modal-box.modal-box-wide {
  width: min(980px, calc(100vw - 40px)) !important;
  height: min(88vh, 900px) !important;
  max-height: calc(100vh - 32px) !important;
  overflow: hidden !important;
}

.modal-box.modal-box-wide .modal-text {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 0 10px 0 0 !important;
}

.standard-content {
  width: 100% !important;
  max-width: 100% !important;
  display: grid !important;
  gap: 18px !important;
  overflow-x: hidden !important;
}

.standard-section,
.standard-intro {
  width: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  padding: 20px !important;
  border-radius: 18px !important;
}

.standard-section h4 {
  margin: 0 0 14px !important;
  font-size: 1.12rem !important;
  line-height: 1.3 !important;
}

.standard-section p,
.standard-intro p,
.standard-section li {
  max-width: 100% !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  line-height: 1.65 !important;
}

.standard-section ul {
  margin: 0 !important;
  padding-left: 22px !important;
  max-width: 100% !important;
}

.standard-section li {
  margin: 6px 0 !important;
}

.standard-card-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 14px !important;
}

.standard-check-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 10px !important;
}

.standard-mini-card,
.standard-check-item {
  min-width: 0 !important;
  padding: 14px !important;
  border: 1px solid #DDE5EE !important;
  border-radius: 16px !important;
  background: #F8FAFD !important;
}

.standard-mini-card strong,
.standard-check-item strong {
  display: block !important;
  margin-bottom: 6px !important;
  color: #121331 !important;
}

.standard-mini-card p,
.standard-check-item span {
  display: block !important;
  color: #697586 !important;
  font-size: 0.86rem !important;
  line-height: 1.55 !important;
}

.standard-note,
.standard-question,
.standard-warning {
  max-width: 100% !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
}

.standard-danger-grid {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 8px !important;
}

.standard-danger-grid span {
  min-width: 0 !important;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
}

.standard-status-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 12px !important;
}

@media (max-width: 900px) {
  .standard-card-grid,
  .standard-check-grid,
  .standard-status-grid,
  .standard-danger-grid {
    grid-template-columns: 1fr !important;
  }
}
@media (max-width: 1180px) { .wecheck-app { width: min(100% - 28px, 1560px); padding-top: 18px; } .wecheck-layout { grid-template-columns: 300px minmax(0, 1fr); gap: 16px; } .status-grid { grid-template-columns: 64px minmax(0, 1fr); } .score-box { grid-column: 1 / -1; border-left: 0; border-top: 1px solid #DDE5EE; padding-left: 0; padding-top: 16px; display: flex; align-items: center; justify-content: space-between; gap: 18px; } .summary-list, .meta-grid { grid-template-columns: 1fr; } }
@media (max-width: 920px) { .wecheck-layout { grid-template-columns: 1fr; } .side { position: relative; top: auto; } .wecheck-workflow { grid-template-columns: repeat(2, minmax(0, 1fr)); } .wecheck-topbar { align-items: flex-start; min-height: auto; } }
@media (max-width: 620px) { .wecheck-app { width: calc(100% - 20px); padding: 10px 0 20px; } .wecheck-topbar { flex-direction: column; } .wecheck-top-actions { justify-content: flex-start; width: 100%; } .wecheck-brand-copy h1 { font-size: 1.22rem; } .wecheck-workflow { grid-template-columns: 1fr; } .step span { white-space: normal; } .card-pad, .status-card { padding: 16px; } .section-head, .summary-head { padding-left: 16px; padding-right: 16px; } .table-wrap, .questions-list, .summary-list, .report-text { padding-left: 16px; padding-right: 16px; } .status-grid { grid-template-columns: 1fr; } .status-icon { width: 58px; height: 58px; border-radius: 18px; font-size: 1.55rem; } .score-box { display: block; } .drop { padding: 18px; } .side-actions { display: none; } .mobile-actions { display: block; } table { min-width: 760px; } .analysis-row { grid-template-columns: 1fr; } .analysis-progress-value { text-align: left; } .field-grid, .meta-grid { grid-template-columns: 1fr; } .modal-actions { flex-direction: column; } }
`;

function App() {
  const [step, setStep] = useState(1);
  const [selectedSampleId, setSelectedSampleId] = useState("license");
  const [analysisMode, setAnalysisMode] = useState("initial");
  const [progress, setProgress] = useState(0);
  const [selectedApprover, setSelectedApprover] = useState("mateusz");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [piotrStage, setPiotrStage] = useState(0);
  const [modalType, setModalType] = useState("");

  const selectedOffer = useMemo(
    () => DEMO_OFFERS.find((offer) => offer.id === selectedSampleId) || DEMO_OFFERS[0],
    [selectedSampleId]
  );

  const report = useMemo(() => {
    if (analysisMode === "corrected" && selectedOffer.corrected) return selectedOffer.corrected;
    return selectedOffer.initial;
  }, [selectedOffer, analysisMode]);

  const currentApprover = APPROVERS.find((item) => item.id === selectedApprover) || APPROVERS[0];

  const completedSteps = {
    1: step > 1,
    2: step > 2,
    3: step > 3,
    4: sent,
  };

  useEffect(() => {
    setSenderName(selectedOffer.author || "");
    setSenderEmail("");
  }, [selectedOffer.id]);

  useEffect(() => {
    if (step !== 2) return undefined;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 7));
    }, 110);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setStep(3);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step, selectedSampleId, analysisMode]);

  const emailSubject = `We’Check AI - Oferta do zatwierdzenia od ${senderName || "[Imię i nazwisko]"}`;
  const emailBody = [
    "Dzień dobry,",
    "",
    "przesyłam ofertę sprawdzoną w We’Check AI i przygotowaną do przekazania do finalnego zatwierdzenia.",
    `Ocena jakości według We’Check AI: ${report.score}/100.`,
    `W załączeniu przesyłam plik oferty: ${selectedOffer.filename}.`,
    "",
    "Proszę o finalne zatwierdzenie dokumentu.",
    "",
    "Pozdrawiam,",
    senderName || "[Imię i nazwisko]",
    senderEmail || "[adres e-mail]",
  ].join("\n");

  const chooseOffer = (id) => {
    setSelectedSampleId(id);
    setAnalysisMode("initial");
    setProgress(0);
    setSent(false);
    setStep(1);
    setUploadNotice("");
    setUploadedFileName("");
    setSelectedApprover("mateusz");
    setPiotrStage(0);
    setModalType("");
  };

  const startAnalysis = () => {
    setSent(false);
    setStep(2);
  };

  const simulateCorrectedVersion = () => {
    if (!selectedOffer.corrected) return;
    setSent(false);
    setAnalysisMode("corrected");
    setStep(2);
  };

  const resetFlow = () => {
    setAnalysisMode("initial");
    setProgress(0);
    setSent(false);
    setStep(1);
    setSelectedApprover("mateusz");
    setPiotrStage(0);
    setModalType("");
  };

  const goToApproval = () => {
    if (!report.allowProceed) return;
    setSent(false);
    setStep(4);
  };

  const handleFakeUpload = (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadNotice(
      "To jest demonstracyjna wersja We’Check AI. Analiza własnych plików będzie dostępna po integracji z API ChatGPT. Na potrzeby prezentacji skorzystaj z przygotowanych ofert demonstracyjnych powyżej."
    );
  };

  const handleApproverSelect = (id) => {
    if (id !== "piotr") {
      setSelectedApprover(id);
      if (id === "mateusz") setPiotrStage(0);
      return;
    }

    if (piotrStage === 0) {
      setModalType("piotr-soft");
      return;
    }

    if (piotrStage === 1) {
      setModalType("piotr-hard");
      return;
    }

    setSelectedApprover("piotr");
  };

  const confirmSoftPiotr = () => {
    setSelectedApprover("piotr");
    setPiotrStage(1);
    setModalType("");
  };

  const chooseMateuszInstead = () => {
    setSelectedApprover("mateusz");
    setPiotrStage(0);
    setModalType("");
  };

  const confirmHardPiotr = () => {
    setSelectedApprover("piotr");
    setPiotrStage(2);
    setModalType("");
  };

  const sendForApproval = () => {
    if (selectedApprover === "piotr" && piotrStage < 2) {
      setModalType("piotr-hard");
      return;
    }
    setSent(true);
  };

  return (
    <div className="wecheck-root">
      <style>{APP_CSS}</style>

      <div className="wecheck-app">
        <div className="wecheck-topbar">
          <div className="wecheck-brand">
            <div className="wecheck-brand-mark">AI</div>
            <div className="wecheck-brand-copy">
              <small>We’Check AI</small>
              <h1>Agent Kontroli Jakości Ofert</h1>
            </div>
          </div>

          <div className="wecheck-top-actions">
            <a
  className="btn btn-ghost"
  href="/wecheck-ai-1-4.txt"
  download="wecheck-ai-1-4.txt"
>
  Prompt v1.4
</a>
            <button className="btn btn-ghost" onClick={() => setModalType("standard")}>
              Standard We'Support
            </button>
          </div>
        </div>

        <div className="wecheck-workflow">
          <StepItem number={1} title="Wgraj ofertę" subtitle="wybór przykładu lub pliku" active={step === 1} done={completedSteps[1]} />
          <StepItem number={2} title="Analiza AI" subtitle="symulacja promptu 1.4" active={step === 2} done={completedSteps[2]} />
          <StepItem number={3} title="Wynik i poprawki" subtitle="pełny raport We’Check AI" active={step === 3} done={completedSteps[3]} />
          <StepItem number={4} title="Wyślij do zatwierdzenia" subtitle="wybór osoby i akcja końcowa" active={step === 4} done={completedSteps[4]} />
        </div>

        <div className="wecheck-layout">
          <aside className="side">
            <section className="card card-pad">
              <h2 className="section-title">Oferty do sprawdzenia</h2>
              <p className="section-desc">
                Wybierz dokument z listy albo wgraj własny plik. We’Check AI przygotuje raport z uwagami, ryzykami i elementami do poprawy przed przekazaniem oferty do zatwierdzenia.
              </p>

              <div className="sample-list">
                {DEMO_OFFERS.map((offer) => (
                  <button key={offer.id} className={`sample-item ${selectedSampleId === offer.id ? "active" : ""}`} onClick={() => chooseOffer(offer.id)}>
                    <div className="sample-top">
                      <div className="sample-title">{offer.title}</div>
                      <Tag type="info">{offer.category}</Tag>
                    </div>
                    <div className="sample-file">{offer.filename}</div>
                  </button>
                ))}
              </div>

              <div className="drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFakeUpload(e.dataTransfer.files?.[0]); }}>
                <div className="drop-icon">↑</div>
                <h3>Upuść plik tutaj</h3>
                <p>Możesz też kliknąć poniżej i wskazać plik z dysku.</p>
                <label className="upload-link">
                  Wybierz plik
                  <input className="upload-input" type="file" onChange={(e) => handleFakeUpload(e.target.files?.[0])} />
                </label>
                <div className="file-selected">
                  <strong>{uploadedFileName || selectedOffer.filename}</strong>
                  <span>{selectedOffer.client} • {selectedOffer.author} • {selectedOffer.category}</span>
                </div>
              </div>

              {uploadNotice && <div className="notice-demo">{uploadNotice}</div>}

              <div className="side-actions">
                <button className="btn btn-primary" onClick={startAnalysis}>Uruchom analizę AI</button>
                <button className="btn btn-ghost" onClick={resetFlow}>Rozpocznij od nowa</button>
              </div>
            </section>
          </aside>

          <main className="main-content">
            {step === 1 && (
              <section className="card status-card">
                <div className="status-grid">
                  <div className="status-icon">1</div>
                  <div>
                    <p className="section-kicker">Krok 1</p>
                    <h2 className="status-title">Wgraj ofertę do analizy</h2>
                    <p className="status-desc">
                      Aktualnie wybrana oferta: <strong>{selectedOffer.title}</strong>. Po kliknięciu Uruchom analizę AI system sprawdzi dokument zgodnie ze standardem We’Support i przygotuje raport jakości.
                    </p>
                    <div className="status-tags">
                      <Tag type="info">{selectedOffer.category}</Tag>
                      <Tag type="info">{selectedOffer.client}</Tag>
                    </div>
                  </div>
                  <div className="score-box">
                    <div>
                      <small>Oferty</small>
                      <strong>3<span>/3</span></strong>
                    </div>
                    <p>Dostępne oferty oczekujące na analizę jakości.</p>
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="card status-card analyzing">
                <div className="status-grid">
                  <div className="status-icon">AI</div>
                  <div>
                    <p className="section-kicker">Krok 2</p>
                    <h2 className="status-title">Trwa analiza AI</h2>
                    <p className="status-desc">
                      We’Check AI analizuje typ oferty, standard We’Support, logikę biznesową, dane, tabele, język oraz gotowość dokumentu do przekazania do zatwierdzenia.
                    </p>
                    <div className="analysis-box">
                      <div className="analysis-rows">
                        {ANALYSIS_LINES.map(([label, sub], index) => {
                          const value = Math.max(progress - index * 12, 0);
                          return (
                            <div className="analysis-row" key={label}>
                              <div className="analysis-copy">
                                <strong>{label}</strong>
                                <span>{sub}</span>
                              </div>
                              <div className="bar"><i style={{ width: `${value}%` }} /></div>
                              <div className="analysis-progress-value">{value}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="score-box">
                    <div>
                      <small>Analiza</small>
                      <strong>1.4</strong>
                    </div>
                    <p>Raport obejmuje pełną kontrolę jakości dokumentu zgodnie ze standardem We’Support.</p>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <>
                <section className={`card status-card ${report.status === "ok" ? "ok" : ""}`}>
                  <div className="status-grid">
                    <div className="status-icon">{report.status === "ok" ? "✓" : "!"}</div>
                    <div>
                      <p className="section-kicker">Krok 3</p>
                      <h2 className="status-title">{report.statusTitle}</h2>
                      <p className="status-desc">{report.statusText}</p>
                      <div className="status-tags">
                        {report.tags.map((item, idx) => (
                          <Tag key={`${item}-${idx}`} type={report.status === "ok" ? "ok" : idx === 0 ? "warning" : "info"}>{item}</Tag>
                        ))}
                      </div>
                    </div>
                    <div className="score-box">
                      <div>
                        <small>Ocena jakości</small>
                        <strong>{report.score}<span>/100</span></strong>
                      </div>
                      <p>{report.allowProceed ? "Oferta może zostać przekazana do jednej z osób zatwierdzających." : "Najpierw popraw wskazane elementy, a potem uruchom analizę ponownie."}</p>
                    </div>
                  </div>
                </section>

                <section className="card summary">
                  <div className="summary-head">
                    <div>
                      <h2>1. Szybkie podsumowanie - co poprawić</h2>
                      <p>Najważniejsze do poprawy lub potwierdzenia w krótkiej formie.</p>
                    </div>
                  </div>
                  <div className="summary-list">
                    {report.quickSummary.map((item, index) => <SummaryCard key={index} index={index + 1} text={item} />)}
                  </div>
                  <div className="approval-actions">
                    {report.status !== "ok" && selectedOffer.corrected && analysisMode === "initial" && (
                      <button className="btn btn-primary" onClick={simulateCorrectedVersion}>Wgraj poprawioną wersję</button>
                    )}
                    {report.allowProceed && <button className="btn btn-dark" onClick={goToApproval}>Przejdź do kroku 4</button>}
                  </div>
                </section>

                <ReportSection title="2. Klasyfikacja oferty" subtitle="Klasyfikacja typu dokumentu i pewność oceny.">
                  <div className="table-wrap">
                    <div className="meta-grid">
                      <div className="meta-box"><small>Typ oferty</small><strong>{report.classification.type}</strong></div>
                      <div className="meta-box"><small>Poziom pewności</small><strong>{report.classification.confidence}</strong></div>
                      <div className="meta-box"><small>Uzasadnienie</small><strong>{report.classification.reason}</strong></div>
                    </div>
                  </div>
                </ReportSection>

                <ReportSection title="3. Werdykt końcowy" subtitle="Decyzja robocza We’Check AI przed przekazaniem do człowieka.">
                  <div className="report-text"><p>{report.verdict}</p></div>
                </ReportSection>

                <TableSection
                  title="4. Najważniejsze uwagi"
                  subtitle="Najważniejsze kwestie do poprawy albo potwierdzenia."
                  columns={[
                    { key: "problem", label: "Problem" },
                    { key: "why", label: "Dlaczego to ważne" },
                    { key: "action", label: "Jak poprawić / co potwierdzić" },
                    { key: "priority", label: "Priorytet" },
                  ]}
                  rows={report.keyIssues}
                  renderCell={(row, key) => key === "priority" ? <Tag type={priorityTone(row.priority)}>{row.priority}</Tag> : row[key]}
                />

                <TableSection
                  title="5. Kontrola standardu We’Support"
                  subtitle="Weryfikacja zgodności ze standardem firmowym."
                  columns={[
                    { key: "element", label: "Element" },
                    { key: "status", label: "Status" },
                    { key: "comment", label: "Komentarz" },
                  ]}
                  rows={report.standardReview}
                  renderCell={(row, key) => key === "status" ? <Tag type={statusTone(row.status)}>{row.status}</Tag> : row[key]}
                />

                <TableSection
                  title="6. Kontrola specyficzna dla typu oferty"
                  subtitle="Sekcja zależna od rodzaju dokumentu."
                  columns={[
                    { key: "element", label: "Element" },
                    { key: "status", label: "Ocena" },
                    { key: "comment", label: "Komentarz" },
                  ]}
                  rows={report.typeReview}
                  renderCell={(row, key) => key === "status" ? <Tag type={statusTone(row.status)}>{row.status}</Tag> : row[key]}
                />

                <TableSection
                  title="7. Szczegółowa tabela błędów"
                  subtitle="Pełna lista lokalizacji, opisów i propozycji poprawek."
                  columns={[
                    { key: "id", label: "Nr" },
                    { key: "location", label: "Lokalizacja" },
                    { key: "category", label: "Kategoria błędu" },
                    { key: "description", label: "Opis błędu" },
                    { key: "fix", label: "Proponowana poprawa" },
                    { key: "priority", label: "Priorytet" },
                  ]}
                  rows={report.errors}
                  renderCell={(row, key) => key === "priority" ? <Tag type={priorityTone(row.priority)}>{row.priority}</Tag> : row[key]}
                />

                <TableSection
                  title="8. Kontrola językowa"
                  subtitle={report.languageReview.note}
                  columns={[
                    { key: "fragment", label: "Fragment" },
                    { key: "problem", label: "Problem" },
                    { key: "fix", label: "Propozycja poprawy" },
                    { key: "reference", label: "Odwołanie" },
                  ]}
                  rows={report.languageReview.rows}
                />

                <TableSection
                  title="9. Kontrola układu, formatowania i czytelności"
                  subtitle="Ocena czytelności dokumentu i jego elementów wizualnych."
                  columns={[
                    { key: "location", label: "Lokalizacja" },
                    { key: "element", label: "Element" },
                    { key: "problem", label: "Problem" },
                    { key: "fix", label: "Propozycja poprawy" },
                    { key: "reference", label: "Odwołanie" },
                  ]}
                  rows={report.layoutReview}
                />

                <TableSection
                  title="10. Kontrola danych i wyliczeń"
                  subtitle="Sprawdzenie liczb, cen, walut i spójności wariantów."
                  columns={[
                    { key: "element", label: "Element" },
                    { key: "status", label: "Status" },
                    { key: "comment", label: "Komentarz" },
                    { key: "reference", label: "Odwołanie" },
                  ]}
                  rows={report.dataReview}
                  renderCell={(row, key) => key === "status" ? <Tag type={statusTone(row.status)}>{row.status}</Tag> : row[key]}
                />

                <TableSection
                  title="11. Ryzyka"
                  subtitle="Ryzyka formalne, biznesowe, operacyjne, rozliczeniowe i wizerunkowe."
                  columns={[
                    { key: "risk", label: "Ryzyko" },
                    { key: "level", label: "Poziom" },
                    { key: "why", label: "Dlaczego to ryzyko" },
                    { key: "action", label: "Co zrobić" },
                    { key: "reference", label: "Odwołanie" },
                  ]}
                  rows={report.risks}
                  renderCell={(row, key) => key === "level" ? <Tag type={priorityTone(row.level)}>{row.level}</Tag> : row[key]}
                />

                <ReportSection title="12. Pytania do osoby przygotowującej ofertę" subtitle="Konkretne pytania, które warto rozstrzygnąć przed przekazaniem do zatwierdzenia.">
                  <div className="questions-list">
                    {report.questions.length === 0 ? (
                      <div className="question-item"><div className="question-no">0</div><div>Brak pytań do osoby przygotowującej ofertę.</div></div>
                    ) : (
                      report.questions.map((question, index) => (
                        <div key={index} className="question-item"><div className="question-no">{index + 1}</div><div>{question}</div></div>
                      ))
                    )}
                  </div>
                </ReportSection>

                <TableSection
                  title="13. Checklista przed przekazaniem do zatwierdzenia"
                  subtitle="Lista działań do odhaczenia przed wysłaniem do osoby decyzyjnej."
                  columns={[
                    { key: "priority", label: "Priorytet" },
                    { key: "task", label: "Zadanie" },
                    { key: "owner", label: "Kto powinien sprawdzić" },
                    { key: "status", label: "Status" },
                  ]}
                  rows={report.checklist}
                  renderCell={(row, key) => key === "priority" ? <Tag type={priorityTone(row.priority)}>{row.priority}</Tag> : row[key]}
                />
              </>
            )}

            {step === 4 && (
              <section className="card card-pad">
                <span className="section-kicker">Krok 4</span>
                <h2 className="section-title">Wyślij do zatwierdzenia</h2>
                <p className="section-desc">Oferta została dopuszczona do przekazania do zatwierdzenia. Wybierz osobę zatwierdzającą, uzupełnij dane autora i przejrzyj gotową treść maila.</p>

                <div className="approval-form">
                  <div className="field">
                    <label>Osoba zatwierdzająca</label>
                    <select className="select" value={selectedApprover} onChange={(e) => handleApproverSelect(e.target.value)}>
                      {APPROVERS.map((approver) => (
                        <option key={approver.id} value={approver.id}>{approver.badge}. {approver.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label>Imię i nazwisko</label>
                      <input className="input" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Imię i nazwisko autora oferty" />
                    </div>
                    <div className="field">
                      <label>Adres e-mail</label>
                      <input className="input" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="adres@we-support.pl" />
                    </div>
                  </div>

                  <div className="mail-preview">
                    <div className="mail-preview-head">
                      <div className="field">
                        <label>Tytuł maila</label>
                        <input className="input" value={emailSubject} readOnly />
                      </div>
                      <div className="field">
                        <label>Treść maila</label>
                        <textarea className="textarea" value={emailBody} readOnly />
                      </div>
                    </div>
                    <div className="mail-help">To jest gotowy szkic wiadomości do osoby zatwierdzającej. Wiadomość zostanie wysłana do wskazanej osoby odpowiedzialnej za finalne zatwierdzenie oferty.</div>
                  </div>
                </div>

                <div className="approval-actions">
                  <button className="btn btn-dark" onClick={sendForApproval}>Wyślij do {currentApprover.name}</button>
                  <button className="btn btn-ghost" onClick={() => setStep(3)}>Wróć do wyniku analizy</button>
                </div>

                {sent && (
                  <div className="send-success" style={{ marginTop: 16 }}>
                    <strong>Status:</strong> oferta przekazana do zatwierdzenia. Osoba zatwierdzająca: <strong>{currentApprover.name}</strong>.
                  </div>
                )}
              </section>
            )}

            <div className="mobile-actions">
              <div className="mobile-actions-inner">
                {step === 1 && <button className="btn btn-primary" onClick={startAnalysis}>Uruchom analizę AI</button>}
                {step === 3 && report.status !== "ok" && selectedOffer.corrected && analysisMode === "initial" && (
                  <button className="btn btn-primary" onClick={simulateCorrectedVersion}>Wgraj poprawioną wersję</button>
                )}
                {step === 3 && report.allowProceed && <button className="btn btn-dark" onClick={goToApproval}>Przejdź do zatwierdzenia</button>}
                {step === 4 && <button className="btn btn-dark" onClick={sendForApproval}>Wyślij do zatwierdzenia</button>}
              </div>
            </div>

            <footer className="footer">
              We’Check AI v1.0 • Copyright © 2026 <a href="https://we-support.pl" target="_blank" rel="noreferrer">We'Support</a> • analiza oparta o Prompt 1.4
            </footer>
          </main>
        </div>
      </div>

      {modalType === "piotr-soft" && (
        <Modal
          title="Jesteś pewny?"
          actions={(
            <>
              <button className="btn btn-ghost" onClick={chooseMateuszInstead}>Wybierz Mateusza Banasiaka</button>
              <button className="btn btn-dark" onClick={confirmSoftPiotr}>Zostaw Piotra Majdana</button>
            </>
          )}
        >
          Może lepiej wybrać Mateusza Banasiaka? To bezpieczniejsza ścieżka dla standardowego obiegu ofert.
        </Modal>
      )}

      {modalType === "piotr-hard" && (
        <Modal
          title="Czy na pewno chcesz wysłać ofertę do Prezesa?"
          actions={(
            <>
              <button className="btn btn-green" onClick={chooseMateuszInstead}>NIE</button>
              <button className="btn btn-red" onClick={confirmHardPiotr}>TAK</button>
            </>
          )}
        >
          Jeśli wybierzesz NIE, aplikacja automatycznie zaznaczy Mateusza Banasiaka. Jeśli wybierzesz TAK, będzie można wysłać ofertę do Piotra Majdana.
        </Modal>
      )}

      {modalType === "standard" && (
  <Modal
    title="Standard We'Support"
    wide
    actions={<button className="btn btn-dark" onClick={() => setModalType("")}>Zamknij</button>}
  >
    <StandardWeSupportContent />
  </Modal>
)}
    </div>
  );
}

export default App;
