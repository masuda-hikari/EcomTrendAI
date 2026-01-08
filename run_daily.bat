@echo off
chcp 65001 > nul
REM EcomTrendAI 日次実行バッチファイル
REM Windows Task Scheduler から呼び出し用

REM 実行ディレクトリに移動
cd /d "%~dp0"

REM 仮想環境を有効化（存在する場合）
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM メインスクリプト実行
python src\main.py --categories electronics computers videogames toys --limit 20

REM 終了コード保持
set EXITCODE=%ERRORLEVEL%

REM 実行日時をログに記録
echo [%date% %time%] Exit code: %EXITCODE% >> logs\run_history.log

exit /b %EXITCODE%
