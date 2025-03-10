@echo off
setlocal enabledelayedexpansion

:: Sprawdź, czy plik package.json istnieje
if not exist package.json (
    echo Błąd: Plik package.json nie istnieje w bieżącym katalogu.
    pause
    exit /b 1
)

:: Wyświetl wersję z package.json używając findstr
for /f "tokens=*" %%a in ('findstr "version" package.json') do (
    set line=%%a
    :: Wyodrębnij wersję z linii
    set line=!line:"version":=!
    set line=!line:"=!
    set line=!line:,=!
    set line=!line: =!

    echo Obecna wersja: !line!
)

echo.

:: Sprawdź, czy jesteśmy w repozytorium git
if not exist .git (
    echo Błąd: Nie jesteś w repozytorium git.
    pause
    exit /b 1
)

:: Pobierz zmiany z gita
git pull origin main

echo.

:: Wyświetl wersję z package.json używając findstr
for /f "tokens=*" %%a in ('findstr "version" package.json') do (
    set line=%%a
    :: Wyodrębnij wersję z linii
    set line=!line:"version":=!
    set line=!line:"=!
    set line=!line:,=!
    set line=!line: =!

    echo Nowa wersja: !line!
)

echo.
echo Zakonczono.
echo.
echo Nacisnij dowolny klawisz, aby zamknąć okno...
pause > nul
