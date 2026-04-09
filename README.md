# tiktok-downloader

Baixa vídeos do TikTok em máxima qualidade, prontos para postar no Instagram Reels.

## O que faz

Lê uma lista de links do TikTok a partir de um arquivo `links.txt` e baixa cada vídeo em MP4 de alta qualidade usando o yt-dlp. Vídeos já baixados são registrados automaticamente para não serem repetidos.

## Requisitos

- [Node.js](https://nodejs.org/) v18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) — `pip install yt-dlp`
- [ffmpeg](https://ffmpeg.org/) — necessário para mesclar áudio e vídeo
- Google Chrome instalado e logado no TikTok (para autenticação via cookies)

## Como usar

1. Crie um arquivo `links.txt` na raiz do projeto com um link do TikTok por linha:

```
https://www.tiktok.com/@usuario/video/123456789
https://www.tiktok.com/@outro/video/987654321
```

2. Rode o script:

```bash
node tiktokdownloader.js
```

Os vídeos serão salvos na pasta `videos/` com o nome no formato `AAAAMMDD_ID.mp4`.

## Observações

- Links já baixados são registrados em `baixados.txt` e ignorados em execuções futuras.
- Apenas links válidos do TikTok são aceitos — links inválidos são ignorados com aviso.
- Caso o yt-dlp não esteja instalado, o script avisa como instalar.
