# -*- coding: utf-8 -*-
"""
レポート生成モジュール

トレンド分析結果を各種フォーマットで出力
"""

from datetime import datetime
from pathlib import Path
from typing import Optional

from loguru import logger

from config import config


class HTMLReportGenerator:
    """HTMLレポート生成"""

    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or config.paths.reports_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(self, trends: list, category_trends: dict) -> Path:
        """
        HTMLレポートを生成

        Args:
            trends: 全体トレンド
            category_trends: カテゴリ別トレンド

        Returns:
            レポートファイルパス
        """
        date_str = datetime.now().strftime("%Y%m%d")
        filename = f"trends_{date_str}.html"
        filepath = self.output_dir / filename

        html_content = self._build_html(trends, category_trends)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)

        logger.info(f"HTMLレポート生成完了: {filepath}")
        return filepath

    def _build_html(self, trends: list, category_trends: dict) -> str:
        """HTMLコンテンツを構築"""
        trend_rows = ""
        for i, t in enumerate(trends[:20], 1):
            price_str = f"¥{t.price:,.0f}" if t.price else "-"
            rating_str = f"★{t.rating:.1f}" if t.rating else "-"
            trend_rows += f"""
            <tr>
                <td>{i}</td>
                <td><a href="{t.affiliate_url}" target="_blank">{t.name[:50]}</a></td>
                <td>{t.category}</td>
                <td class="positive">+{t.rank_change_percent:.0f}%</td>
                <td>{t.trend_score}</td>
                <td>{price_str}</td>
                <td>{rating_str}</td>
            </tr>
            """

        category_sections = ""
        for category, items in category_trends.items():
            items_html = ""
            for i, t in enumerate(items[:5], 1):
                items_html += f"""
                <li>
                    <a href="{t.affiliate_url}" target="_blank">{t.name[:40]}</a>
                    <span class="change">+{t.rank_change_percent:.0f}%</span>
                </li>
                """
            category_sections += f"""
            <div class="category-section">
                <h3>{category}</h3>
                <ol>{items_html}</ol>
            </div>
            """

        return f"""
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcomTrendAI トレンドレポート - {datetime.now().strftime('%Y/%m/%d')}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        header h1 {{ font-size: 2em; margin-bottom: 10px; }}
        header p {{ opacity: 0.9; }}
        .card {{
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .card h2 {{
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }}
        th {{ background: #f8f9fa; font-weight: 600; }}
        tr:hover {{ background: #f8f9fa; }}
        a {{ color: #667eea; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
        .positive {{ color: #22c55e; font-weight: bold; }}
        .category-section {{
            display: inline-block;
            width: calc(33% - 20px);
            vertical-align: top;
            margin: 10px;
        }}
        .category-section h3 {{
            color: #764ba2;
            margin-bottom: 10px;
        }}
        .category-section ol {{ padding-left: 20px; }}
        .category-section li {{ margin-bottom: 8px; }}
        .change {{ color: #22c55e; margin-left: 10px; font-size: 0.9em; }}
        footer {{
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
        }}
        @media (max-width: 768px) {{
            .category-section {{ width: 100%; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>EcomTrendAI トレンドレポート</h1>
            <p>生成日時: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}</p>
        </header>

        <div class="card">
            <h2>急上昇商品 TOP 20</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>商品名</th>
                        <th>カテゴリ</th>
                        <th>変動</th>
                        <th>スコア</th>
                        <th>価格</th>
                        <th>評価</th>
                    </tr>
                </thead>
                <tbody>
                    {trend_rows}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>カテゴリ別トレンド</h2>
            {category_sections}
        </div>

        <footer>
            <p>このレポートは EcomTrendAI によって自動生成されました。</p>
            <p>商品リンクにはアフィリエイトIDが含まれています。</p>
        </footer>
    </div>
</body>
</html>
        """
