# EcomTrendAI タスクスケジューラ登録スクリプト
# 管理者権限で実行: PowerShell -ExecutionPolicy Bypass -File schedule_task.ps1

$ErrorActionPreference = "Stop"

# 設定
$TaskName = "EcomTrendAI_DailyRun"
$TaskDescription = "EcomTrendAI日次データ収集・レポート生成"
$ScriptPath = Join-Path $PSScriptRoot "run_daily.bat"
$RunTime = "06:00"  # 毎日6:00に実行

Write-Host "=== EcomTrendAI タスクスケジューラ登録 ===" -ForegroundColor Cyan

# 既存タスクの確認・削除
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "既存タスクを削除: $TaskName" -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# アクション定義
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`"" -WorkingDirectory $PSScriptRoot

# トリガー定義（毎日指定時刻）
$Trigger = New-ScheduledTaskTrigger -Daily -At $RunTime

# 設定
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1)

# タスク登録
Register-ScheduledTask `
    -TaskName $TaskName `
    -Description $TaskDescription `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -RunLevel Highest

Write-Host ""
Write-Host "タスク登録完了: $TaskName" -ForegroundColor Green
Write-Host "  実行時刻: 毎日 $RunTime" -ForegroundColor White
Write-Host "  実行ファイル: $ScriptPath" -ForegroundColor White
Write-Host ""
Write-Host "手動実行テスト:" -ForegroundColor Cyan
Write-Host "  schtasks /run /tn `"$TaskName`"" -ForegroundColor White
Write-Host ""
Write-Host "タスク削除:" -ForegroundColor Cyan
Write-Host "  Unregister-ScheduledTask -TaskName `"$TaskName`" -Confirm:`$false" -ForegroundColor White
