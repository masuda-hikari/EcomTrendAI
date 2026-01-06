# -*- coding: utf-8 -*-
"""
pytest設定・共通フィクスチャ
"""

import os
import sys
from pathlib import Path

# srcディレクトリをパスに追加（pyproject.toml経由でも設定されるが念のため）
src_path = Path(__file__).parent.parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# テスト用環境変数設定
os.environ.setdefault("LOG_LEVEL", "WARNING")
os.environ.setdefault("REQUEST_DELAY_SECONDS", "0.1")
