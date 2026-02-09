#!/usr/bin/env python3
"""
Script para extrair conteúdo das páginas HTML do curso e gerar documentos Markdown.
Gera um arquivo por módulo na pasta doc_projeto/conteudo_modulos/

Uso: python export_content.py
"""

import os
import json
import re
from pathlib import Path
from html.parser import HTMLParser


class HTMLToMarkdown(HTMLParser):
    """Parser para converter HTML em Markdown."""
    
    def __init__(self):
        super().__init__()
        self.markdown = []
        self.current_tag = None
        self.skip_tags = {'script', 'style', 'svg', 'path', 'circle', 'button', 'img'}
        self.skip_depth = 0
        self.list_depth = 0
        self.in_list_item = False
        
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags or self.skip_depth > 0:
            self.skip_depth += 1
            return
            
        self.current_tag = tag
        attrs_dict = dict(attrs)
        
        if tag == 'h1':
            self.markdown.append('\n## ')
        elif tag == 'h2':
            self.markdown.append('\n### ')
        elif tag == 'h3':
            self.markdown.append('\n#### ')
        elif tag == 'h4':
            self.markdown.append('\n##### ')
        elif tag == 'p':
            self.markdown.append('\n')
        elif tag == 'strong' or tag == 'b':
            self.markdown.append('**')
        elif tag == 'em' or tag == 'i':
            self.markdown.append('*')
        elif tag == 'ul' or tag == 'ol':
            self.list_depth += 1
            self.markdown.append('\n')
        elif tag == 'li':
            self.in_list_item = True
            indent = '  ' * (self.list_depth - 1)
            self.markdown.append(f'{indent}- ')
        elif tag == 'br':
            self.markdown.append('\n')
        elif tag == 'blockquote':
            self.markdown.append('\n> ')
        elif tag == 'a':
            href = attrs_dict.get('href', '')
            self.markdown.append('[')
            self._pending_href = href
            
    def handle_endtag(self, tag):
        if self.skip_depth > 0:
            self.skip_depth -= 1
            return
            
        if tag in ('h1', 'h2', 'h3', 'h4', 'p'):
            self.markdown.append('\n')
        elif tag in ('strong', 'b'):
            self.markdown.append('**')
        elif tag in ('em', 'i'):
            self.markdown.append('*')
        elif tag in ('ul', 'ol'):
            self.list_depth = max(0, self.list_depth - 1)
        elif tag == 'li':
            self.in_list_item = False
            self.markdown.append('\n')
        elif tag == 'a':
            href = getattr(self, '_pending_href', '')
            self.markdown.append(f']({href})')
        elif tag == 'blockquote':
            self.markdown.append('\n')
            
    def handle_data(self, data):
        if self.skip_depth > 0:
            return
        text = data.strip()
        if text:
            self.markdown.append(text + ' ')
            
    def get_markdown(self):
        result = ''.join(self.markdown)
        # Limpar espaços extras e linhas em branco múltiplas
        result = re.sub(r'\n{3,}', '\n\n', result)
        result = re.sub(r' +', ' ', result)
        return result.strip()


def extract_page_content(html_path: Path) -> str:
    """Extrai o conteúdo de uma página HTML e converte para Markdown."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        parser = HTMLToMarkdown()
        parser.feed(html_content)
        return parser.get_markdown()
    except Exception as e:
        return f"*Erro ao processar: {e}*"


def generate_module_document(module: dict, pages_dir: Path) -> str:
    """Gera o documento Markdown para um módulo específico."""
    
    module_id = module.get('id', '')
    module_title = module.get('title', '')
    module_icon = module.get('icon', '')
    
    lines = [
        f"# {module_icon} {module_title}",
        f"*ID: {module_id}*",
        "",
        "---",
        ""
    ]
    
    # Processar cada página do módulo
    for page_path in module.get('pages', []):
        full_path = pages_dir / page_path
        
        if not full_path.exists():
            lines.append(f"## ⚠️ Página não encontrada: {page_path}")
            lines.append("")
            continue
            
        # Extrair nome da página do caminho
        page_name = Path(page_path).stem
        page_name_formatted = page_name.replace('_', ' ').title()
        
        lines.append(f"## 📄 {page_name_formatted}")
        lines.append(f"*Arquivo: `{page_path}`*")
        lines.append("")
        
        # Extrair e adicionar conteúdo
        content = extract_page_content(full_path)
        if content:
            lines.append(content)
        else:
            lines.append("*Página vazia ou sem conteúdo textual.*")
        
        lines.append("")
        lines.append("---")
        lines.append("")
    
    return '\n'.join(lines)


def main():
    # Detectar diretório base
    script_dir = Path(__file__).parent
    base_path = script_dir
    
    # Carregar content.json
    content_json_path = base_path / "content.json"
    
    if not content_json_path.exists():
        print(f"❌ Arquivo content.json não encontrado em: {content_json_path}")
        return
    
    print("📖 Carregando estrutura do curso...")
    with open(content_json_path, 'r', encoding='utf-8') as f:
        content_json = json.load(f)
    
    print(f"📚 Encontrados {len(content_json)} módulos")
    
    # Criar pasta de saída
    output_dir = base_path / "doc_projeto" / "conteudo_modulos"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    pages_dir = base_path / "paginas"
    total_words = 0
    total_lines = 0
    modules_processed = 0
    
    # Gerar um documento por módulo
    for module in content_json:
        module_id = module.get('id', '')
        module_title = module.get('title', '')
        module_icon = module.get('icon', '')
        is_hidden = module.get('hidden', False)
        
        if is_hidden:
            print(f"  ⏭️ Pulando módulo oculto: {module_title}")
            continue
        
        print(f"  📝 Processando: {module_icon} {module_title}...")
        
        # Gerar documento do módulo
        markdown_content = generate_module_document(module, pages_dir)
        
        # Nome do arquivo baseado no ID do módulo
        # Extrair número do módulo (ex: module_01 -> M1)
        module_num = module_id.replace('module_', 'M')
        # Limpar título para nome de arquivo
        clean_title = re.sub(r'[^\w\s-]', '', module_title).strip()
        clean_title = re.sub(r'\s+', '_', clean_title)
        
        filename = f"{module_num}_{clean_title}.md"
        output_path = output_dir / filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        # Estatísticas
        word_count = len(markdown_content.split())
        line_count = markdown_content.count('\n')
        total_words += word_count
        total_lines += line_count
        modules_processed += 1
        
        print(f"    ✅ Salvo: {filename} ({word_count} palavras)")
    
    print("")
    print(f"✅ Exportação concluída!")
    print(f"📁 Pasta: {output_dir}")
    print(f"📊 Total: {modules_processed} módulos, {total_words} palavras, {total_lines} linhas")


if __name__ == "__main__":
    main()
