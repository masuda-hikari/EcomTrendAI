# -*- coding: utf-8 -*-
"""
デプロイ・サーバー管理スクリプト

本番環境へのデプロイと管理を支援
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path

# プロジェクトルート
PROJECT_ROOT = Path(__file__).parent.parent
SRC_DIR = PROJECT_ROOT / "src"


def check_environment():
    """環境チェック"""
    print("=== 環境チェック ===")

    # Python バージョン
    py_version = sys.version_info
    if py_version < (3, 12):
        print(f"警告: Python 3.12+ 推奨（現在: {py_version.major}.{py_version.minor}）")
    else:
        print(f"OK: Python {py_version.major}.{py_version.minor}.{py_version.micro}")

    # 依存関係
    required = ["fastapi", "uvicorn", "stripe", "pydantic"]
    missing = []
    for pkg in required:
        try:
            __import__(pkg)
            print(f"OK: {pkg}")
        except ImportError:
            missing.append(pkg)
            print(f"NG: {pkg} がインストールされていません")

    if missing:
        print(f"\n依存関係をインストール: pip install {' '.join(missing)}")
        return False

    # .env ファイル
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        print("OK: .env ファイル存在")
    else:
        print("警告: .env ファイルがありません（.env.example をコピーしてください）")

    # Stripe設定
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if stripe_key:
        if stripe_key.startswith("sk_live_"):
            print("OK: Stripe本番キー設定済み")
        elif stripe_key.startswith("sk_test_"):
            print("警告: Stripeテストキー使用中（本番ではsk_live_を使用）")
        else:
            print("警告: Stripeキー形式不正")
    else:
        print("警告: STRIPE_SECRET_KEY 未設定")

    return True


def run_dev_server(host: str = "0.0.0.0", port: int = 8000):
    """開発サーバー起動"""
    print(f"=== 開発サーバー起動 ({host}:{port}) ===")

    os.chdir(SRC_DIR)
    cmd = [sys.executable, "api.py", "--host", host, "--port", str(port)]
    subprocess.run(cmd)


def run_prod_server(host: str = "0.0.0.0", port: int = 8000, workers: int = 4):
    """本番サーバー起動（Gunicorn）"""
    print(f"=== 本番サーバー起動 ({host}:{port}, workers={workers}) ===")

    try:
        import gunicorn
    except ImportError:
        print("gunicorn をインストールしてください: pip install gunicorn")
        return

    os.chdir(SRC_DIR)
    cmd = [
        "gunicorn",
        "api:create_app",
        "-k", "uvicorn.workers.UvicornWorker",
        "-w", str(workers),
        "-b", f"{host}:{port}",
        "--access-logfile", "-",
        "--error-logfile", "-",
    ]
    subprocess.run(cmd)


def generate_systemd_service(
    service_name: str = "ecomtrend-api",
    user: str = "www-data",
    workers: int = 4,
):
    """systemdサービスファイル生成"""
    print("=== systemdサービスファイル生成 ===")

    venv_path = PROJECT_ROOT / "venv"

    service_content = f"""[Unit]
Description=EcomTrendAI API Server
After=network.target

[Service]
User={user}
Group={user}
WorkingDirectory={SRC_DIR}
Environment="PATH={venv_path}/bin"
ExecStart={venv_path}/bin/gunicorn api:create_app -k uvicorn.workers.UvicornWorker -w {workers} -b 127.0.0.1:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
"""

    output_file = PROJECT_ROOT / "scripts" / f"{service_name}.service"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(service_content)

    print(f"生成: {output_file}")
    print(f"\nインストール手順:")
    print(f"  sudo cp {output_file} /etc/systemd/system/")
    print(f"  sudo systemctl daemon-reload")
    print(f"  sudo systemctl enable {service_name}")
    print(f"  sudo systemctl start {service_name}")


def run_tests():
    """テスト実行"""
    print("=== テスト実行 ===")

    os.chdir(PROJECT_ROOT)
    cmd = [sys.executable, "-m", "pytest", "tests/", "-v", "--tb=short"]
    result = subprocess.run(cmd)
    return result.returncode == 0


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description="EcomTrendAI デプロイスクリプト")

    subparsers = parser.add_subparsers(dest="command", help="コマンド")

    # check
    subparsers.add_parser("check", help="環境チェック")

    # dev
    dev_parser = subparsers.add_parser("dev", help="開発サーバー起動")
    dev_parser.add_argument("--host", default="0.0.0.0")
    dev_parser.add_argument("--port", type=int, default=8000)

    # prod
    prod_parser = subparsers.add_parser("prod", help="本番サーバー起動")
    prod_parser.add_argument("--host", default="0.0.0.0")
    prod_parser.add_argument("--port", type=int, default=8000)
    prod_parser.add_argument("--workers", type=int, default=4)

    # systemd
    systemd_parser = subparsers.add_parser("systemd", help="systemdサービスファイル生成")
    systemd_parser.add_argument("--name", default="ecomtrend-api")
    systemd_parser.add_argument("--user", default="www-data")
    systemd_parser.add_argument("--workers", type=int, default=4)

    # test
    subparsers.add_parser("test", help="テスト実行")

    args = parser.parse_args()

    # .env読み込み
    from dotenv import load_dotenv
    load_dotenv(PROJECT_ROOT / ".env")

    if args.command == "check":
        check_environment()
    elif args.command == "dev":
        run_dev_server(args.host, args.port)
    elif args.command == "prod":
        run_prod_server(args.host, args.port, args.workers)
    elif args.command == "systemd":
        generate_systemd_service(args.name, args.user, args.workers)
    elif args.command == "test":
        success = run_tests()
        sys.exit(0 if success else 1)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
