# EcomTrendAI バックエンドAPI Docker イメージ
# Python 3.12 + FastAPI + Gunicorn

FROM python:3.12-slim

# ラベル
LABEL maintainer="EcomTrendAI Team"
LABEL version="1.0"
LABEL description="EcomTrendAI API Server"

# 環境変数
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# 作業ディレクトリ
WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# アプリケーションコード
COPY src/ ./src/
COPY data/ ./data/

# 非rootユーザー
RUN useradd --create-home --shell /bin/bash appuser
RUN chown -R appuser:appuser /app
USER appuser

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# ポート公開
EXPOSE 8000

# 起動コマンド
CMD ["gunicorn", "src.api:create_app", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "--access-logfile", "-", "--error-logfile", "-"]
